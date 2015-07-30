 (function(factory) {
     'use strict';
     if (typeof define === 'function' && define.amd) {
         define([
             'jquery'
         ], factory);
     } else if (typeof define === 'function' && define.cmd) {
         define([
             'jquery'
         ], factory);
     } else if (typeof exports === 'object') {
         factory(
             require('jquery')
         );
     } else {
         factory(window.jQuery);
     }
 }(function($){
     'use strict';

     var ImageUpload = function() {
         this.init.apply(this, arguments);
     };

     $.extend(ImageUpload.prototype, {
         $file: null,
         fileList: null,
         isReplaceFileInput: true,
         //上传并发限制
         uploadLimit: 3,
         //上传url
         url: null,
         isAppend: false,
         init: function(config) {
             $.extend(this, config);
             this.initEvent();
             this.ready();
         },
         ready: function() {

         },
         initEvent: function() {
             var me = this;
             this.$file.on('change', function(event) {
                 me.onChangeHandle(event);
                 this.value = '';
             });
         },
         start: function() {

             delete this.isCancel;

             var me = this,
                 fileList;
             fileList = me.fileList || {};
             if (fileList.length == 0) {
                 return;
             }

             var send = fileList.send;
             var index = fileList.index;

             send = send || 0;
             index = index || 0;
             while (me.uploadLimit > send && index < fileList.length) {
                 for (var key in fileList) {
                     if (fileList.hasOwnProperty(key)) {
                         var file = fileList[key];
                         if (file instanceof File) {
                             if (!file) {
                                 return;
                             }
                             delete fileList[file._key_];
                             me.send(file);
                             send++;
                             fileList.send = send;

                             index++;
                             fileList.index = index;
                             break;
                         }
                     }
                 }

             }
         },
         cancel: function() {
             var me = this,
                 sendingMap = me.sendingMap;
             delete this.sendingMap;
             delete this.fileList;

             for (var key in sendingMap) {
                 var file = sendingMap[key];
                 file.xhr.abort();
                 delete file.xhr;
             }

             this.onCancel();
             this.isCancel = true;
         },
         delete: function() {

         },
         send: function(file) {
             var me = this,
                 xhr;
             xhr = new XMLHttpRequest();
             if (!xhr.upload) {
                 return;
             }
             // 上传中
             xhr.upload.addEventListener("progress", function(e) {
                 var loaded = e.loaded,
                     total = e.total,
                     percent;
                 percent = ((loaded / total) * 100).toFixed(2);
                 me.onProgress({
                     file: file,
                     loaded: loaded,
                     total: total,
                     percent: percent
                 });
             }, false);

             // 文件上传成功或是失败
             xhr.onreadystatechange = function(e) {
                 if (xhr.readyState == 4) {
                     me.onCompleteHandle(file);
                     if (xhr.status == 200) {
                         me.onSuccess(file, xhr.responseText);
                     } else {
                         me.onError(file, xhr.responseText);
                     }

                 }
             };
             // 开始上传
             xhr.open("POST", me.url, true);

             var formData = new FormData();
             formData.append('file', file, encodeURIComponent(file.name));


             if (me.sendingMap) {
                 file.xhr = xhr;
                 me.sendingMap[file._key_] = file;
             }

             xhr.send(formData);

             me.onSendAfter(file);
         },
         onSendAfter: function(file) {

         },
         onCancel: function() {

         },
         onProgress: function(event) {
             console.info(event);
         },
         onSuccess: function(file) {

         },
         onError: function(file) {

         },
         onCompleteHandle: function(file) {
             var me = this;
             if (this.isCancel) {
                 return;
             }

             if (me.sendingMap) {
                 delete me.sendingMap[file._key_];
             }

             if (!me.fileList || !me.fileList.length) {
                 //全部完毕
                 me.onFinishHandle();
             } else {
                 me.fileList.send--;
                 me.start();
             }
         },
         onComplete: function(file) {

         },
         onChangeHandle: function(event) {
             var me = this,
                 fileList = me.fileList || {};
             me.sendingMap = [];
             if (!me.isAppend) {
                 fileList = {};
             }
             if (!fileList.length) {
                 fileList.length = 0;
             }
             var files = event.target.files,
                 list = [];
             for (var i = 0, len = files.length; i < len; i++) {
                 var file = files[i];
                 file._key_ = file.lastModified + '_' + file.size;
                 if (!fileList[file._key_]) {
                     list.push(file);
                     fileList[file._key_] = file;
                     fileList.length++
                 }
             }
             me.fileList = fileList;
             if (list.length > 0) {
                 this.onChange(list);
             }
         },
         onChange: function(event) {},
         onFinishHandle: function() {
             var me = this,
                 sendingMap = me.sendingMap;
             for (var key in sendingMap) {
                 var file = sendingMap[key];
                 delete file.xhr;
             }
             delete me.sendingMap;
             delete me.fileList;
             delete me.isCancel;
         },
         onFinish: function() {

         },
         readDataURL: function(file, callback) {
             var reader = new FileReader();
             var me = this;
             reader.onload = function(e) {
                 callback.apply(me, [file, e.target.result]);
             };
             reader.readAsDataURL(file);
         },
         onDeleteHandle: function(file) {
             var me = this;
             delete me.fileList[file._key_];
             me.fileList.length--;

         }
     });

     $.imageupload = function(config) {
         return new ImageUpload(config);
     };


 }));
