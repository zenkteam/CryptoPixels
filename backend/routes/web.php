<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MetaController;

Route::post('api/meta', MetaController::class.'@getMetadataByPixelId');
Route::get('api/pixel/{id}', MetaController::class.'@getPixel');

Route::get('/', function () {
    exit("Pepe? Is it you?");
});
