<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class MetaController extends Controller
{
    /**
     * Returns the meta information for each pixel
     */
    public function getPixel($id){
        if($id === 'center'){
            return $this->getCenterpiece();
        } else {
            $id = (int) $id;
        }

        $pixelData = $this->getPixelData($id);
        return [
            "name" => "CryptoPixel#" . $id,
            "description" => "This CryptoPixel lives " . $pixelData['x'] . "px to the right and " . $pixelData['y'] . "px down south.",
            "external_url"=> "https://cryptopixels.org/#CryptoPixel-" . $id,
            "image"=> "https://cryptopixels.org/pixels/" . $id . ".png",
            "attributes"=> [
                [
                    "trait_type"=> "nr",
                    "value"=> $id
                ],
                [
                    "trait_type"=> "x",
                    "value"=> $pixelData['x']
                ],
                [
                    "trait_type"=> "y",
                    "value"=> $pixelData['y']
                ],
                [
                    "trait_type"=> "column",
                    "value"=> $pixelData['column']
                ],
                [
                    "trait_type"=> "row",
                    "value"=> $pixelData['row']
                ],
                [
                    "trait_type"=> "value",
                    "value"=> 100
                ]
            ]
        ];
    }

    /**
     * Returns the centerpiece's meta information
     */
    private function getCenterpiece(){
        return [
            "name" => "CryptoPixel#Center",
            "description" => "This CryptoPixel lives right in the center.",
            "external_url"=> "https://cryptopixels.org/#CryptoPixel-Center",
            "image"=> "https://cryptopixels.org/pixels/center.jpg",
            "attributes"=> [
                [
                    "trait_type"=> "nr",
                    "value"=> "Center has no number"
                ],
                [
                    "trait_type"=> "value",
                    "value"=> 40000
                ]
            ]
        ];
    }

    /**
     * Calculates columns, rows, x- & y-coordinate based on the id
     */
    private function getPixelData($id){

        // There are 100 columns and 100 Rows
        // To determine the column we just want to break down the id to ten-digits
        // If the id is smaller 100, column is automatically id
            // as e.g. id 3 points to the third pixel in the first row
        if($id > 999){
            $column = $id % 1000; // ignore thousand-digit

            if($column > 99){
                $column = $column % 100; // ignore hundred digit
            }
        } else if ($id > 100){
            $column = $id % 100;
        } else {
            $column = $id;
        }
        // If %-rest equals zero, it has to be a full hundred and column = 100
        if($column === 0){
            $column = 100;
        }

        // There are only 100 columns of 10px width, whereby first pixel starts on 0px
        $x = ($column-1) * 10;

        // There are only 100 rows. Let's see how often the 100 fits in.
        // Beware that if id is < 100, it is supposed to be row 1
        // Let's say id is 100, then we want row to be 1 after we added 1
        // Because if id is 400, row is actually 3:
        // Row 1: 1 - 100
        // Row 2: 101 - 200
        // Row 3: 201 - 300
        // Row 4: 301 - 400
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

    /**
     * Returns meta information for multiple pixels
     */
    // public function getMetadataByPixelId(Request $request){
    //     $ids = $request->input('p');
    //     $code = 200;
    //     $data = [];
    //     $error = '';

    //     foreach($ids as $id){
    //         $id = intval($id);

    //         if($id < 1 || $id > 10000){
    //             $code = 400;
    //             $error = 'Invalid pixel';
    //             break;
    //         }

    //         if($this->isReserved($id)){
    //             $code = 400;
    //             $error = 'Reserved pixel';
    //             break;
    //         }
    //     }

    //     if($error !== ''){
    //         $data['error'] = $error;
    //     }else{
    //         $data['pixel'] = [];
    //         foreach($ids as $id){
    //             $data['pixel'][] = $this->getPixelData($id);
    //         }
    //     }

    //     return response()->json($data, $code);
    // }

    // private function isReserved($id) {
    //     if($id < 4040 || $id > 5961) {
    //         return false;
    //     }
    //     $t = $id % 1000;
    //     if($t > 100){
    //         $t = $t % 100;
    //     }
    //     return $t > 40 && $t < 61;
    // }

}
