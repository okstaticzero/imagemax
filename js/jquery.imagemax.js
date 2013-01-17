/*
  Imagemax - Fullscreen jQuery Plugin
  Version : 1.0
  Site  : www.zerostatic.com/imagemax
  License : MIT License
*/
(function( $ ){

  var methods = {
     init : function( options) {
        // Create some defaults, extending them with any options that were provided
      var settings = $.extend( {
        'speed'         : 1000,
        'centerVertical' : true,
        'centerHorizontal' : true,
        'transition': 'crossfade', // crossfade or slide
        'slideType':'horizontal', // horizontal or vertical
        'preCache':false,
        'prevButton':null,
        'nextButton':null,
        'thumbList':null,
        'imageArray': [],
        'easing':'swing',
        'autoPlay': 0,
        'preloader': null,
        'fadeFirstLoad': true,
        beforeLoad: function(){ },
        afterLoad: function(){ },
        afterTransition : function(){ }
        
      }, options);
        //
       return this.each(function(){
         
        var $this = $(this);
        //
        $this.css({'left':0, 'top':0, 'overflow':'hidden'});

         // If the plugin hasn't been initialized yet
         if ( ! data ) {
           //
           $(this).data('imagemax', {
              target : $this,
              speed : settings.speed,
              centerVertical: settings.centerVertical,
              centerHorizontal: settings.centerHorizontal,
              imageArray: settings.imageArray,
              imgRatio: 1000/500,
              beforeLoad: settings.beforeLoad,
              afterLoad: settings.afterLoad,
              afterTransition: settings.afterTransition,
              transition: settings.transition,
              preCache:  settings.preCache,
              slideType: settings.slideType,
              thumbList: settings.thumbList,
              nextButton:settings.nextButton,
              prevButton:settings.prevButton,
              easing: settings.easing,
              slideDirection: 'left',
              preloader: settings.preloader,
              fadeFirstLoad: settings.fadeFirstLoad, // first load makes the first slide crossfade if set to slide
              curslide:0,
              startWidth:0,
              scalePercent:0,
              autoPlay: settings.autoPlay,
              left:0,
              top:0
           });
           //
           var data = $(this).data('imagemax');
           //
           
           $(data.nextButton).click(function(e) {
              $this.imagemax('next');
              e.preventDefault();
           });
            $(data.prevButton).click(function(e) {
              $this.imagemax('prev');
              e.preventDefault();
           });
            $(data.thumbList).find('li').click(function(e) {
              var index = $(this).index();
              $this.imagemax('goTo', index);
              e.preventDefault();
           });
           
          // store image references
            if($this.find('img').length > 0 ){
                for(var i=0; i<$this.find('img').length; i++){
                  var imgPath = $this.find('img').eq(i).attr('data-src');
                  data.imageArray.push(imgPath);
                }
            }
            //
            $this.find('img').remove();
            //
            if(data.imageArray.length >0 ){
                 $(this).imagemax('goTo', 0);
            }
           //
           $(window).bind('resize.imagemax', function () {
                _resizeimg($this);
            });
        }
         
       });
     },
     destroy : function() {
        
       return this.each(function(){
         $(window).unbind('resize.imagemax');
       });
     },
     goTo:function(index, trans, slideDir) {
      var $this = $(this);
      var data = $this.data('imagemax');
      //set direction
      if(data.slideType ==="horizontal"){
        if(data.curslide > index){
          data.slideDirection ="right";
          if(index===0 && data.curslide === data.imageArray.length){
            data.slideDirection ="left";
          }
        }else{
          data.slideDirection ="left";
          if(index===data.imageArray.length && data.curslide ===0){
            data.slideDirection ="right";
          }
        }
      }else{
        //else direction is vertical
        if(data.curslide > index){
          data.slideDirection ="down";
          if(index===0 && data.curslide === data.imageArray.length){
            data.slideDirection ="up";
          }
        }else{
          data.slideDirection ="up";
          if(index===data.imageArray.length && data.curslide ===0){
            data.slideDirection ="down";
          }
        }
      }
      //
      data.curslide = index;
      $this.imagemax('load', data.imageArray[index],trans, slideDir);
     },
     next: function(){
      var $this = $(this);
      var data = $this.data('imagemax');

      var cur = data.curslide;
      cur++;
      if(cur > data.imageArray.length-1){
          cur = 0;
      }
      if(data.slideType ==="horizontal"){
       data.slideDirection = 'left';
      }else{
        data.slideDirection = 'up';
      }
      $this.imagemax('goTo', cur, data.transition , data.slideDirection);
     },
     prev: function(){
      var $this = $(this);
      var data = $this.data('imagemax');
      var cur = data.curslide;
      cur--;
      if(cur < 0){
          cur = data.imageArray.length-1;
      }
      if(data.slideType ==="horizontal"){
        data.slideDirection = 'right';
      }else{
        data.slideDirection = 'down';
      }
      $this.imagemax('goTo', cur, data.transition , data.slideDirection);
     },
     load : function(src, trans, slideDir) { 
        var $this = $(this);
        //if not trying to load the same image...
        if(src !== $this.find('img').attr('src')){  
          var img;
          var data =$(this).data('imagemax');
          clearTimeout($this.data('timeout'));
          if (slideDir) {
            data.slideDirection = slideDir;
          }
          if(trans){
            data.transition = trans;
          }
          $(data.preloader).show();
          // delete any old images
          $this.find("img").addClass("markdelete");
          //
          data.beforeLoad({index: data.curslide});
          img = $("<img />").css({position: "absolute", display: "none", margin: 0, padding: 0, border: "none", maxWidth: "none"})
              .bind("load", function(e) {
                  var $self = $(this),
                      imgWidth, imgHeight;

                  $self.css({width: "auto", height: "auto"});
                  imgWidth =  $(e.target).width();
                  imgHeight =  $(e.target).height();

                  var imgRatio = imgWidth / imgHeight;

                  data.imgRatio = imgRatio;
                  data.startWidth = imgWidth;
                  //console.log('imgRatio: '+ imgRatio);
                  // _resizeimg($this);
                  if(data.preCache && data.fadeFirstLoad){preCache($this);}
                  //console.log("XX: "+ $this.attr('id'));
                  if(data.transition === "crossfade" || data.fadeFirstLoad){
                    _resizeimg($this);
                    $self.fadeIn(data.speed, function(){
                        // Remove the old images, if necessary.
                        $this.find('.markdelete').remove();
                        data.afterTransition({index: data.curslide});
                        $this.imagemax('checkAutoPlay');
                        data.fadeFirstLoad = false;
                    });
                  }
                  if(data.transition === "instant"){
                    $self.show();
                    $this.find('.markdelete').remove();
                    data.afterTransition({index: data.curslide});
                    $this.imagemax('checkAutoPlay');
                    data.fadeFirstLoad = false;

                  }
                  if(data.transition === "slide" && !data.fadeFirstLoad){
                    _resizeimg($this, true);
                    var startPos;
                    var endPos;
                    var bgw;
                    var bgh;
                    var offset;
                    if(data.slideDirection === "left" || data.slideDirection === "right"){
                      if(data.centerVertical){
                        _centerVert($this);
                      }
                      // LEFT ////////
                      bgw = $this.parent().width();
                      bgh = $this.parent().height();
                      
                      offset = (bgw - $this.find('img').width()) * 0.5;
                      if(!data.centerVertical){
                        offset = 0;
                      }
                      if(data.slideDirection === 'left'){
                        startPos = offset + $self.width();
                        endPos = - ($self.width()-offset);
                      }
                       if(data.slideDirection === 'right'){
                        startPos = offset - $self.width();
                        endPos =  ($self.width()+offset);
                      }

                      //console.log('S: '+ startPos);
                      $self.css({'left': startPos+'px'}).show();
                      $self.animate({'left': offset}, data.speed, data.easing,function() {
                        // Animation complete.
                      });
                      $this.find('.markdelete').animate({'left': endPos}, data.speed, data.easing, function() {
                      // Animation complete.
                      $(this).remove();
                      data.afterTransition({index: data.curslide});
                      $this.imagemax('checkAutoPlay');
                    });
                    }
                    if(data.slideDirection === "up" || data.slideDirection === "down"){
                      if(data.centerHorizontal){
                        _centerHorz($this);
                      }
                      // up ////////
                      bgw = $this.parent().width();
                      bgh = $this.parent().height();
                      offset = (bgh - $this.find('img').height()) * 0.5;
                      if(!data.centerHorizontal){
                        offset = 0;
                      }
                      if(data.slideDirection === 'up'){
                        startPos = offset + $self.height();
                        endPos = - ($self.height()-offset);
                      }
                       if(data.slideDirection === 'down'){
                        startPos = offset - $self.height();
                        endPos =  ($self.height()+offset);
                      }

                      //console.log('S: '+ startPos);
                      $self.css({'top': startPos+'px'}).show();
                      $self.animate({'top': offset}, data.speed, function() {
                        // Animation complete.
                      });
                      $this.find('.markdelete').animate({'top': endPos}, data.speed, function() {
                      // Animation complete.
                      $(this).remove();
                      data.afterTransition({index: data.curslide});
                      $this.imagemax('checkAutoPlay');
                    });
                    }
                  }
                  //
                  data.afterLoad({index: data.curslide});
                  $(data.preloader).fadeOut();
              })
              .appendTo($this);

              img.attr("src", src); // to work in IE
            }
              //
     },
     newImageSet: function(arr, thumbList){
        var $this = $(this);    
        var data = $this.data('imagemax');
        data.imageArray = arr;
        $(this).imagemax('goTo', 0);
        //if setting a new thumblist
        if (thumbList) {
          $(this).data('thumbList', thumbList);
          $(thumbList).find('li').click(function(e) {
                var index = $(this).index();
                $this.imagemax('goTo', index);
                e.preventDefault();
             });
        }
      },

      clear: function() {
          //removes any images
          var $this = $(this);
          $this.find('img').remove();    
      },

      checkAutoPlay: function(){
        var $this = $(this);    
        var data = $this.data('imagemax');
        //start autoplay
           if (data.autoPlay > 0 && data.imageArray.length > 1) {
             //start autoplay
             var sto = setTimeout(function() {
                  $this.imagemax('next');
              }, data.autoPlay);

             $this.data('timeout', sto);
          }
      }
  };

function preCache(e){
  var $this = e;
  var data = $this.data('imagemax');
  //
  var tempImg = [];
  for(var i=1; i<data.imageArray.length ; i++){
      tempImg[i] = new Image();
      tempImg[i].src = data.imageArray[i];
  }
}
function  _resizeimg(e, skipCenter) { 
        var $this = e;
        var data = $this.data('imagemax');
        //
        var bgw = $this.parent().width();
        var bgh = $this.parent().height();
        //
        var bgHeight = bgw / data.imgRatio;
        var bgWidth = bgw;


        if(bgHeight >= bgh) {
          
        }else{
          bgHeight = bgh;
          bgWidth = bgh * data.imgRatio;
        }

         $this.find('img').css({width: bgWidth, height: bgHeight});

         ///center 
         if (!skipCenter) {
            _center(e);
         }
         //
         data.scalePercent =  bgWidth/data.startWidth;
         data.left = $this.find('img').css('left');
         data.top = $this.find('img').css('top');
         
     }
     //
    function _center(e){
        var $this = e;
        var data = $this.data('imagemax');
        //
        if(data.centerHorizontal){
          _centerHorz(e);
        }
        if(data.centerVertical){
          _centerVert(e);
        }
    } 
    //
    function _centerHorz(e){
      var $this = e;
      //var data = $this.data('imagemax');
      var bgw = $this.parent().width();
      //var bgh = $this.parent().height();
      var offset = (bgw - $this.find('img').width()) * 0.5;
              //console.log('offset: '+ offset);
              $this.find('img').css({
                  left: offset + 'px'
              });
    }
     function _centerVert(e){
      var $this = e;
      //
      var bgh = $this.parent().height();
      var topOffset = (bgh - $this.find('img').height()) * 0.5;
               $this.find('img').css({
                    top: topOffset + 'px'
                });
    }

  $.fn.imagemax = function( method ) {
    //
    if ( methods[method] ) {
      return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof method === 'object' || ! method ) {
      return methods.init.apply( this, arguments );
    } else {
      $.error( 'Method ' +  method + ' does not exist on jQuery.imagemax' );
    }
  };

})( jQuery );