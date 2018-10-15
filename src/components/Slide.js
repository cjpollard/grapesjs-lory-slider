import constants from '../constants';
import { elHasClass } from '../utils';

export default (dc, config = {}) => {
  const defaultType = dc.getType('image');
  const defaultModel = defaultType.model;
  const defaultView = defaultType.view;
  const { slideName, slideId, slidesSelector } = constants;

  dc.addType(slideName, {

    model: defaultModel.extend({
      defaults: {
        ...defaultModel.prototype.defaults,
        name: 'Slide',
        draggable: slidesSelector,
        style: {
          display: `inline-block`,
          position: 'relative',
          color: '#fff',
          width: '100%',
          'vertical-align': 'top',
          'min-height': '130px',
          'white-space': 'normal',
          'background-color': 'rgba(0, 0, 0, 0.1)',
        },
        ...config.slideProps
      },
    }, {
      isComponent(el) {
        if (elHasClass(el, config.classSlide)) return { type: slideName };
      },
    }),

    view: defaultView
  });
}
