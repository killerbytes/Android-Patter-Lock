
function PatternLock(el, cb){
    this.initialize (...arguments);
}

PatternLock.prototype = {

    initialize: function(el, cb){
        var cb = cb;
        this.pattern = [];
        this.start = false;
        this.el = document.getElementById(el);
        this.position = null;
        this.offsetLeft = this.el.getBoundingClientRect().left;
        this.offsetTop = this.el.getBoundingClientRect().top;
        
        this.getCurrentElement = (x,y)=>{
            return document.elementFromPoint(x, y);
        }
        this.add = (el)=>{
            $(el).addClass('selected')
            this.pattern.push(el.id);
            this.drawLine(el.getBoundingClientRect().left, el.getBoundingClientRect().top);
        }
        this.getElementCenter = (el)=>{
            return {
                x: (el.getBoundingClientRect().left - this.offsetLeft)+(el.getBoundingClientRect().width/2),
                y: (el.getBoundingClientRect().top - this.offsetTop)+(el.getBoundingClientRect().width/2)
            }
        }
        this.drawLine = (x,y)=>{
            if(this.position){
                $(this.el).find('.line').hide();
                let prev = this.getElementCenter(this.getCurrentElement(this.position[0], this.position[1]))
                $(this.el).find('.line').show();
                
                let xdiff = x -this.position[0];
                let ydiff = y - this.position[1];
                let deg = Math.round((Math.atan2(ydiff, xdiff) * 180) / Math.PI)
                let length = Math.ceil(Math.sqrt(xdiff * xdiff + ydiff * ydiff))
                let $div = $('<div>');
                $div.addClass('line');
                $div.css({
                    left: `${prev.x}px`,
                    top: `${prev.y}px`,
                    width: `${length}px`,
                    transform: `rotate(${deg}deg)`
                })
                this.position = [x, y];
                $(this.el).append($div);
                
            }else{
                this.position = [x, y]
            }
        }

        this.moveHandler = (e)=>{
            let el = this.getCurrentElement(e.pageX || e.originalEvent.touches[0].pageX, e.pageY || e.originalEvent.touches[0].pageY)
            if(this.start && $(el).hasClass('dot') &&  !$(el).hasClass('selected') ){
                this.add(el);
            }

        }

        this.startHandler = (e)=>{
            this.reset();
            this.start = true;
            this.moveHandler(e)
        }

        this.end = (e)=>{
            this.start = false;
            if(cb) cb.call(this);
        }

        this.reset = ()=>{
            this.pattern = [];
            this.position = null;
            $(this.el)
            .find('ul').removeClass('success error')
            .find('li.selected').removeClass('selected');
            $(this.el).find('.line').remove();
        }

        this.get = ()=>{
            return this.pattern.join("");
        }

        this.bindEvents = ()=>{
            $(this.el).on('mousedown touchstart', 'li', this.startHandler)
            $(this.el).on('mouseover touchmove', 'li', this.moveHandler)
            $(this.el).on('mouseup touchend', 'ul', this.end)
        }

        this.init = ()=>{

            let $ul = $('<ul>')
            for(let ctr=0; ctr<=8   ; ctr++){
                $ul.append(`<li id=${ctr} class="dot"></li>`)
            }
            $(this.el).append($ul);
            this.bindEvents();
        }

        this.init();

        return {
            get: this.get
        }

    }

}
    


$(function(){
    let master = new PatternLock('pattern');
    let lock = new PatternLock('lock', function(){
        let pattern = master.get();
        let result = lock.get();
        if(pattern === result){
            $(this.el).find('ul').addClass('success')
        }else{
            $(this.el).find('ul').addClass('error')
        }
    });
})
