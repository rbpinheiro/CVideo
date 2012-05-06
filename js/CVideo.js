function CVideo(videoId, filter, width, height) {
	this.video = document.getElementById(videoId);
	this.width = width || this.video.clientWidth;
	this.height = height || this.video.clientHeight;
	this.dynamicSize = !(width > 0);
	this.status = {
	    playing: this.video.autoplay,
    	mute: false,
    	volume: 1
	};
	this.filters = ['none', 'greyscale', 'logo'];
	this.setFilter(filter);
	this.setup();
}

CVideo.prototype = {
    setup: function() {
        var self = this;
        
        this.wrap = document.createElement('div');
        this.wrap.id = 'CVwrap-' + this.video.id;
        
        this.controls = document.createElement('div');
        this.controls.id = 'CVcontrols-' + this.video.id;
        
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'CV-' + this.video.id;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        
        this.back_canvas = document.createElement('canvas');
        this.back_canvas.width = this.width;
        this.back_canvas.height = this.height;
        
        document.getElementById('content').insertBefore(this.wrap, this.video);//better solution needed
        this.wrap.appendChild(this.canvas);
        this.wrap.appendChild(this.controls);
        
        this.buttons = {};
        this.buttons.play = document.createElement('a');
        this.buttons.play.id = 'CVbtn-play';
        this.buttons.play.title = 'Play';
        this.buttons.play.href = 'javascript:;';
        this.buttons.play.appendChild(document.createTextNode("Play"));
        
        this.controls.appendChild(this.buttons.play);
        
        this.buttons.mute = document.createElement('a');
        this.buttons.mute.id = 'CVbtn-mute';
        this.buttons.mute.title = 'Mute';
        this.buttons.mute.href = 'javascript:;';
        this.buttons.mute.appendChild(document.createTextNode("Mute"));
        
        this.controls.appendChild(this.buttons.mute);
        
        this.context = this.canvas.getContext('2d');
        this.back_context = this.back_canvas.getContext('2d');
        
        setInterval(function() {
            self.draw();
        }, 20);
        
        this.bindEvents();
    },
    bindEvents: function() {
        var self = this;
        
        this.video.addEventListener('loadeddata', function() {
            if (self.dynamicSize) {
                self.width = self.video.clientWidth;
                self.height = self.video.clientHeight;
                self.canvas.width = self.width;
                self.canvas.height = self.height;
                self.back_canvas.width = self.width;
                self.back_canvas.height = self.height;
            }
            self.draw();
        }, false);
        
        this.buttons.play.addEventListener('click', function() {
            self.play();
        }, false);
        
        this.buttons.mute.addEventListener('click', function() {
            self.mute();
        }, false);
        
    },
    draw: function() {
        this.filtersDraw[this.filter].apply(this);
    },
    setFilter: function(filter) {
        if (this.filters.indexOf(filter) >= 0) {
            this.filter = filter;
        } else {
            throw 'Invalid filter.'
        }
    },
    play: function() {
        if (this.status.playing) {
            this.video.pause();
            this.buttons.play.innerHTML = 'Play';
            this.buttons.play.title = 'Play';
        } else {
            this.video.play();
            this.buttons.play.innerHTML = 'Pause';
            this.buttons.play.title = 'Pause';
        }
        this.status.playing = !this.status.playing;
    },
    mute: function() {
        if (this.status.mute) {
            this.video.volume = this.status.volume;
        } else {
            this.video.volume = 0;
        }
        this.status.mute = !this.status.mute;
    }
};

CVideo.prototype.filtersDraw = {
    'none': function() {
        this.context.drawImage(this.video, 0, 0, this.width, this.height);
    },
    'greyscale': function() {
        this.back_context.drawImage(this.video, 0, 0, this.width, this.height);
        var image_data = this.back_context.getImageData(0, 0, this.width, this.height);
        var data = image_data.data;
        var i;
        var r;
        var g;
        var b;
        var brightness;
        for (i=0; i<data.length; i++) {
            r = data[i];
            g = data[i+1];
            b = data[i+2];
            brightness = (3*r+4*g+b)>>>3;
            data[i] = brightness;
            data[i+1] = brightness;
            data[i+2] = brightness;
        }
        
        image_data.data = data;
        this.context.putImageData(image_data, 0, 0);
    },
    'logo': function() {
        if (!this.logo_img) {
            this.logo_img = new Image();
            this.logo_img.src = "media/logo.png";
        }
        this.context.drawImage(this.video, 0, 0, this.width, this.height);
        this.context.drawImage(this.logo_img, this.width-(this.logo_img.width + 15), this.height-(this.logo_img.height + 15));
    }
};