/* global _, $ */
(function (window, site) {
  'use strict';

  var _storage = site.storage;
  var _keys = site.keys;
  var C = site.commands;
  var E = site.events;
  var H = site.helpers;
  var POST_AUTH_REDIRECT = _keys.postAuthRedirect;
  var POST_AUTH_OVERRIDE = _keys.postAuthOverride;

  preDomReady();

  function preDomReady(){
    initEvents()
  }

  function initEvents(){
    E.on('global:ready', ready);
    E.on('modal:did-open:contact-us', initContactUsModalUI);
    E.on('api:complete:createCollectionObject', handleCreateCollectionObjectResponse);
  }

  function ready() {
    $(document).on('click', '[data-target="open-contact-modal"]', function(e){
      H.stopEvents(e);
      C.run('modal:open', 'contact-us');
    });
  };

  function handleCreateCollectionObjectResponse(data){
    C.run('modal:close');
  }

  function initContactUsModalUI(){
    $('.modal').on('submit', '[data-form="shipping-address-form"]', function(e){
      H.stopEvents(e);
      var formData = H.getFormData(this);
      console.log(formData);
      var payload = {
        data: formData,
        collection: 'contacts'
      }
      if(site.context.firePageData.orderId){
        payload.orderId = site.context.firePageData.orderId
      }
      C.run('api:createCollectionObject', payload);
    });
  };

})(window, window.site);
