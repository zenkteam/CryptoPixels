<?php

namespace App\Http\Controllers;

use DateTime;
use Illuminate\Http\Request;
use App\Models\Pixel;

class PixelsController extends Controller
{
    public function all(Request $request) {
        return Pixel::all();
    }

    public function create(Request $request) {
        $validatedData = $request->validate([
            'id' => 'required|int|min:1|max:10000',
            'to' => 'int|min:1|max:10000',
            'owner' => 'string',
            'image' => 'image|mimes:png|max:2048',
            'link' => 'url',
        ]);

        $pixelId = (int) $request->id;
        $pixelToId = (int) $request->to;

        $owner = $request->owner;
        $imageName = null;
        $link = $request->link;

        if ($request->image) {
            // save Image
            $timestap = (new DateTime())->getTimestamp();
            $imageName = $pixelId . '.' . $timestap . '.png';
            $request->file('image')->storeAs('uploads', $imageName);
        }

        // update Database
        $pixel = Pixel::where('pixel_id', $pixelId)->first();
        if ($pixel) $pixel->delete();
        $newPixel = Pixel::create([
            'pixel_id' => $pixelId,
            'pixel_to_id' => $pixelToId ?: $pixelId,
            'owner' => $owner ?: ($pixel ? $pixel->owner : null), // ToDo: fill after verification
            'image' => $imageName ?: ($pixel ? $pixel->image : null),
            'link' => $link ?: ($pixel ? $pixel->link : null),
        ]);

    }
}
