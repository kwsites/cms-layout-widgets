const _ = require('lodash');

module.exports = {
   extend: 'apostrophe-widgets',
   label: 'Layout Widget',

   addFields: [

      {
         type: 'select',
         name: 'columnCount',
         choices: [
            {
               value: '2',
               label: 'Two',
               showFields: ['layout2cols'],
            },

            {
               value: '3',
               label: 'Three',
               showFields: [],
            },

         ],
      },

      {
         name: 'layout2cols',
         type: 'select',
         label: 'Column Layout',
         choices: [
            {
               value: 'col-layout-wide-narrow',
               label: '[.....wide.....][narrow]',
            },
            {
               value: '',
               label: '[ equal ][ equal ]',
            },
            {
               value: 'col-layout-narrow-wide',
               label: '[narrow][.....wide.....]',
            },
         ]
      },

      {
         type: 'boolean',
         name: 'singletons',
         label: 'Single item per area'
      },

      {
         type: 'select',
         name: 'gridGapCss',
         label: 'Grid Gap',
         choices: [
            {
               value: '',
               label: 'Default',
            },
            {
               value: 'grid-gap-s',
               label: 'Small',
            },
            {
               value: 'no-grid-gap',
               label: 'None',
            },
         ]
      },

      {
         name: 'itemAlpha',
         label: 'Widget 1',
         type: 'area',
         contextual: true,
         options: {},
      },

      {
         name: 'itemBeta',
         label: 'Widget 2',
         type: 'area',
         contextual: true,
         options: {},
      },

      {
         name: 'itemGamma',
         label: 'Widget 3',
         type: 'area',
         contextual: true,
         options: {},
      },

   ],

   afterConstruct (self) {

      self.layoutAreaNames = [];

      self.schema
         .filter(_.matchesProperty('type', 'area'))
         .forEach(child => {
            self.layoutAreaNames.push(child.name);
            child.options.widgets = self.options.widgets;
         });

   },

   construct (self, options) {

      if (!options || !options.widgets) {
         throw new Error(`cms-layout-widgets must be configured with the widgets it can display`);
      }

      self.load = _.wrap(self.load, (load, req, widgets, callback) => {

         widgets.forEach(widget => {
            widget._areas = self.layoutAreaNames.slice(0, +widget.columnCount).map(key => ({
               key,
               options: {
                  widgets: options.widgets,
                  limit: widget.singletons ? 1 : 10,
               },
            }));

            widget._containerClass = cssLayout(widget);
         });

         return load(req, widgets, callback);
      });

      self.pushAssets = _.wrap(self.pushAssets, (pushAssets, ...args) => {
         self.pushAsset('stylesheet', 'always', {when: 'always'});
         pushAssets(...args);
      });

   }

};

function cssLayout (widget) {
   let css = `${ widget.gridGapCss } col-count-${ widget.columnCount }`;


   if (widget._areas.length === 2) {
      css += ` ${ widget.layout2cols }`;
   }

   return css.trim();
}
