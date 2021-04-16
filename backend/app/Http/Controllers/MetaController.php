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
        if($id > 999){
            $t = $id % 1000;
            if($t > 100){
                $t = $t % 100;
            } 
            $column = $t;
        } else if ($id > 100){
            $column = $id - intval($id / 100) * 100;
        } else {
            $column = $id; 
        }

        // There are only 100 columns of 10px width whereby first starts on 0px
        $x = ($column-1) * 10;

        // There are only 100 rows. Let's see how often the 100 fits in.
        // Beware that if id is < 100, it is supposed to be row 1
        // Let's say id is 100, then we want row to be 1 after we added 1
        // Because if id is 400, 
        $row = intval(($id-1)/100) + 1;
        $y = ($row-1)*10;

        return [
            'id' => $id,
            'column' => $column,
            'x'  => $x,
            'row' => $row,
            'y'  => $y,
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
