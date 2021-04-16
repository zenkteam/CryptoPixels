<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class MetaController extends Controller
{

    public function getMetadataByPixelId(Request $request){
        $ids = $request->input('p');
        $code = 200;
        $data = [];
        $error = '';

        foreach($ids as $id){
            $id = intval($id);

            if($id < 1 || $id > 10000){
                $code = 400;
                $error = 'Invalid pixel';
                break;
            }

            if($this->isReserved($id)){
                $code = 400;
                $error = 'Reserved pixel';
                break;
            }
        } 

        if($error !== ''){
            $data['error'] = $error;
        }else{
            
            $data['pixel'] = [];
            foreach($ids as $id){
                $data['pixel'][] = $this->getPixelData($id);
            }
            
        }

        return response()->json($data, $code);
    }

    private function getPixelData($id){
        $row = 1;
        $column = 0;
        for($i = 1; $i <= $id; ++$i){
            ++$column;

            if($column === 100){
                $column = 0;
                $row += 1;
            }
        }

        $x = ($column-1)*10;
        $y = ($row-1)*10;
        
        return [
            'id' => $id,
            'x'  => $x,
            'y'  => $y
        ];
    }

    private function isReserved($id) {
        if($id < 4040 || $id > 5961) {
            return false;
        }
        $t = $id % 1000;
        if($t > 100){
            $t = $t % 100;
        } 
        return $t > 40 && $t < 61;
    }

}
