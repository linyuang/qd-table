/**
 * Created by Administrator on 2017/11/21.
 */
onmessage = function (event) {
    let time;
    if(event.data == 'start'){
        time = setInterval(function () {
            postMessage(1);
        },1000)
    }
};