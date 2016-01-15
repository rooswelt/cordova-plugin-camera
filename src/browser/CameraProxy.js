/*
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

function takePicture(success, error, opts) {
    if (opts && opts[2] === 1) {
        capture(success, error);
    } else {
        var input = document.createElement('input');
        input.type = 'file';
        input.name = 'files[]';

        input.onchange = function (inputEvent) {
            var canvas = document.createElement('canvas');

            var reader = new FileReader();
            reader.onload = function (readerEvent) {
                input.parentNode.removeChild(input);

                var imageData = readerEvent.target.result;

                return success(imageData.substr(imageData.indexOf(',') + 1));
            }

            reader.readAsDataURL(inputEvent.target.files[0]);
        };

        document.body.appendChild(input);
    }
}

function capture(success, errorCallback) {
    var localMediaStream;

    var video = document.createElement('video');
    var button = document.createElement('button');
    var stopButton = document.createElement('button');

    video.width = 320;
    video.height = 240;
    button.innerHTML = 'Capture';
    stopButton.innerHTML = 'Cancel';
    button.onclick = function () {
        // create a canvas and capture a frame from video stream
        var canvas = document.createElement('canvas');
        canvas.width = 320;
        canvas.height = 240;
        canvas.getContext('2d').drawImage(video, 0, 0, 320, 240);

        // convert image stored in canvas to base64 encoded image
        var imageData = canvas.toDataURL('img/png');
        imageData = imageData.replace('data:image/png;base64,', '');

        // stop video stream, remove video and button
        // localMediaStream.stop() -- Deprecated https://developers.google.com/web/updates/2015/07/mediastream-deprecations
        localMediaStream.getTracks().forEach(function (track){
            track.stop();
        });
        video.parentNode.removeChild(video);
        button.parentNode.removeChild(button);
        stopButton.parentNode.removeChild(stopButton);

        return success(imageData);
    };

    function stopTrack(track) {
        track.stop();
};

    stopButton.onclick = function () {
      // stop video stream, remove video and button
      // localMediaStream.stop() -- Deprecated https://developers.google.com/web/updates/2015/07/mediastream-deprecations
      localMediaStream.getTracks().forEach(function (track){
          track.stop();
      });
        video.parentNode.removeChild(video);
        button.parentNode.removeChild(button);
        stopButton.parentNode.removeChild(stopButton);
    };

    navigator.getUserMedia = navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            navigator.msGetUserMedia;

    var successCallback = function (stream) {
        localMediaStream = stream;
        video.src = window.URL.createObjectURL(localMediaStream);
        video.play();

        var videoContainer = document.getElementById('video-container');
        if (videoContainer) {
            videoContainer.appendChild(video);
            videoContainer.appendChild(button);
            videoContainer.appendChild(stopButton);
        } else {
            document.body.appendChild(video);
            document.body.appendChild(button);
            document.body.appendChild(stopButton);
        }
    };

    if (navigator.getUserMedia) {
        navigator.getUserMedia({video: true, audio: true}, successCallback, errorCallback);
    } else {
        alert('Browser does not support camera :(');
    }
}

module.exports = {
    takePicture: takePicture,
    cleanup: function () {
    }
};

require("cordova/exec/proxy").add("Camera", module.exports);
