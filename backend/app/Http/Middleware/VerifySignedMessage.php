<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Elliptic\EC;
use kornrunner\Keccak;

class VerifySignedMessage
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        // Check for valid signature
        $sig = $request->input('sig', false);
        $pub = $request->input('pub', false);

        if($sig === false){
            abort(419, 'Signature missing');
        }

        if($pub === false){
            abort(419, 'Public key missing');
        }

        // https://github.com/simplito/elliptic-php#verifying-ethereum-signature 
        $test = $this->verifySignature('test', $sig, $pub);
        dd(var_dump($test));


        return $next($request);
    }

    function pubKeyToAddress($pubkey) {
        return "0x" . substr(Keccak::hash(substr(hex2bin($pubkey->encode("hex")), 1), 256), 24);
    }
    
    function verifySignature($message, $signature, $address) {
        $msglen = strlen($message);
        $hash   = Keccak::hash("\x19Ethereum Signed Message:\n{$msglen}{$message}", 256);
        $sign   = ["r" => substr($signature, 2, 64), 
                   "s" => substr($signature, 66, 64)];
        $recid  = ord(hex2bin(substr($signature, 130, 2))) - 27; 
        if ($recid != ($recid & 1)) 
            return false;
    
        $ec = new EC('secp256k1');
        $pubkey = $ec->recoverPubKey($hash, $sign, $recid);
    
        return $address == $this->pubKeyToAddress($pubkey);
    }
}


