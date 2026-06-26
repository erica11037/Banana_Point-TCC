function ativarTrailer(video){
    if (video.paused) {
        video.play();
        video.controls = true;
    }
}