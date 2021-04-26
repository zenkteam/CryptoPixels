<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MetaController;
use App\Http\Middleware\VerifySignedMessage;

Route::get('pixel/{id}', MetaController::class.'@getPixel');

Route::get('/', function () {
    exit("Pepe? Is it you?");
});

Route::post('/test', function () {
    exit("NICE");
})->middleware(VerifySignedMessage::class);
