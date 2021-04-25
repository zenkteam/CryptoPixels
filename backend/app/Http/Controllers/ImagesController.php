<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use DateTime;

class ImagesController extends Controller
{
    public function upload(Request $request) {
        $validatedData = $request->validate([
            'image' => 'required|image|mimes:png|max:2048',
            'id' => 'required|int|min:1|max:10000',
            'to' => 'int|min:1|max:10000',
        ]);

        $request->file('image')->storeAs('uploads', $request->id . '.png');
        // area file
        if ($request->to) {
            $request->file('image')->storeAs('uploads', $request->id . '-' . $request->to . '.png');
        }
        // backup file
        $request->file('image')->storeAs('backup', $request->id . '_' . (new DateTime())->getTimestamp() . '.png');

        return [
            'success' => true
        ];
    }
}
