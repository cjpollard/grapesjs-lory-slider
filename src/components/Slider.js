import constants from '../constants';

export default (em, config = {}) => {
  const dc = em.DomComponents;
  const defaultType = dc.getType('default');
  const defaultModel = defaultType.model;
  const defaultView = defaultType.view;
  const {
    frameName,
    prevSelector,
    nextSelector,
    sliderName,
    slidesName,
    prevName,
    nextName,
    sliderId,
    prevId,
    nextId,
    frameId,
    slidesId,
    slideId
  } = constants;

  dc.addType(sliderName, {

    model: defaultModel.extend({
      defaults: {
        ...defaultModel.prototype.defaults,

        name: 'Slider',

        // Slides scrolled at once
        'slides-to-scroll': 1,

        // Enabled mouse events
        'enable-mouse-events': false,

        // Number of slides
        'slide-amount': 3,

        // Time in milliseconds for the animation of a valid slide attempt
        'slide-speed': 300,

        // Time in milliseconds for the animation of the rewind after the last slide
        'rewind-speed': 600,

        // Time for the snapBack of the slider if the slide attempt was not valid
        'snap-back-speed': 200,

        // Like carousel, works with multiple slides. (do not combine with rewind)
        infinite: false,

        // If slider reached the last slide, with next click the slider goes
        // back to the startindex. (do not combine with infinite)
        rewind: false,

        // Cubic bezier easing functions: http://easings.net/de
        ease: 'ease',

        droppable: `${prevSelector}, ${nextSelector}`,

        style: {
          position: 'relative',
          width: '100%',
          margin: '0 auto',
          padding: '5px 0'
        },

        traits: [{
          type: 'checkbox',
          label: 'Infinite',
          name: 'infinite',
          changeProp: 1,
        },{
          type: 'checkbox',
          label: 'Rewind',
          name: 'rewind',
          changeProp: 1,
        },{
          type: 'number',
          label: 'Number of slides',
          name: 'slide-amount',
          changeProp: 1
        },{
          type: 'number',
          label: 'Slide speed',
          name: 'slide-speed',
          changeProp: 1,
        },{
          type: 'number',
          label: 'Rewind speed',
          name: 'rewind-speed',
          changeProp: 1,
        }, {
          type: 'number',
          label: 'Slides to scroll',
          name: 'slides-to-scroll',
          changeProp: 1,
        }, {
          type: 'select',
          label: 'Timing',
          name: 'ease',
          changeProp: 1,
          options: [
            'ease',
            'linear',
            'ease-in',
            'ease-out',
            'ease-in-out'
          ]
        }],

        'script-deps': config.script,
        'class-frame': config.classFrame,
        'class-slides': config.classSlides,
        'class-prev': config.classPrev,
        'class-next': config.classNext,

        script() {
          var el = this;
          var deps = '{[ script-deps ]}';
          var falsies = ['0', 'false'];
          var infinite = '{[ infinite ]}';
          infinite = infinite == 'true' ? 1 : parseInt(infinite, 10);
          var options = {
            slidesToScroll: parseInt('{[ slides-to-scroll ]}', 10),
            enableMouseEvents: falsies.indexOf('{[ enable-mouse-events ]}') >= 0 ? 0 : 1,
            infinite: isNaN(infinite) ? false : infinite,
            rewind: falsies.indexOf('{[ rewind ]}') >= 0 ? false : true,
            slideAmount: parseInt('{[ slide-amount ]}', 10),
            slideSpeed: parseInt('{[ slide-speed ]}', 10),
            rewindSpeed: parseInt('{[ rewind-speed ]}', 10),
            snapBackSpeed: parseInt('{[ snap-back-speed ]}', 10),
            ease: '{[ ease ]}',
            classNameFrame: '{[ class-frame ]}',
            classNameSlideContainer: '{[ class-slides ]}',
            classNamePrevCtrl: '{[ class-prev ]}',
            classNameNextCtrl: '{[ class-next ]}',
          };

          var initSlider = function() {
            window.sliderLory = lory(el, options);
          };

          if (deps && typeof lory == 'undefined') {
            var script = document.createElement('script');
            script.src = deps;
            script.onload = initSlider;
            document.head.appendChild(script);
          } else {
            initSlider();
          }
        },
        ...config.sliderProps
      },

      init(...args) {
        defaultModel.prototype.init.apply(this, args);
        this.listenTo(this, 'change:slide-amount', this.updateSlides);
      },

      updateSlides(model, slideAmount) {
        let slides = model.components().at(0).components().at(0).components();
        if(slides.length > 0) {
          if(slideAmount < slides.length) {
            const diff = slides.length - slideAmount;
            for(let j=0; j<diff; j++) {
              slides.pop();
            }
          }
          if(slideAmount > slides.length) {
            const diff = slideAmount - slides.length;
            for(let i=0; i<diff; i++) {
              const newSlide = slides.at(slides.length-1).clone();
              slides.push(newSlide);
            }
          }
        }
      },

      initToolbar(...args) {
        defaultModel.prototype.initToolbar.apply(this, args);
        const em = this.em;

        if(em) {
          const cmd = em.get('Commands');
          const cmdName = 'slider-edit';

          if(cmd.has(cmdName)) {
            let hasButton = false;
            const tb = this.get('toolbar');

            for(let i=0; i < tb.length; i++) {
              if(tb[i].command === 'slider-edit') {
                hasButton = true;
                break;
              }
            }

            if(!hasButton) {
              tb.push({
                attributes: {class: 'fa fa-pencil'},
                command: cmdName
              });
              this.set('toolbar', tb);
            }
          }
        }
      }
    }, {
      isComponent(el) {
        if (el.hasAttribute && el.hasAttribute(sliderId)) {
          return { type: sliderName };
        }
      },
    }),

    view: defaultView.extend({
      init() {
        const props = ['slides-to-scroll', 'enable-mouse-events', 'slide-speed',
          'rewind-speed', 'snap-back-speed', 'infinite', 'rewind', 'ease', 'slide-amount'];
        const reactTo = props.map(prop => `change:${prop}`).join(' ');
        this.listenTo(this.model, reactTo, this.render);
        const comps = this.model.components();

        // Add a basic template if it's not yet initialized
        if (!comps.length) {
          comps.add(`<div data-gjs-type="${frameName}">
              <div data-gjs-type="${slidesName}">${config.slideEls}</div>
          </div>
          <span data-gjs-type="${prevName}">${config.prevEl}</span>
          <span data-gjs-type="${nextName}">${config.nextEl}</span>`);
        }
      },
    }),
  });
}
