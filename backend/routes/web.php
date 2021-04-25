<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MetaController;
use App\Http\Controllers\ImagesController;

Route::get('pixel/{id}', MetaController::class.'@getPixel');
Route::get('images/{ids}', ImagesController::class.'@getImagesByPixelId');

Route::get('/', function () {
    exit("Pepe? Is it you?");
});
