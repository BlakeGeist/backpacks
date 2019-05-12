/* global $ */
'use strict';

(function (window, site) {

  var H = site.helpers;
  var C = site.commands;
  var E = site.events;
  var CONTEXT = site.context;
  var USER;
  var db = firebase.firestore();

  H.requireAuth();

  preDomReady();

  function preDomReady(){
    initEvents();
  }

  function initEvents(){
    E.on('global:ready', ready);
    E.on('me:loggedIn', userCheck);
    E.on('api:complete:importCardsFromSet', handleImportCardsFromSet);
    E.on('api:complete:updateSet', handleImportCardsFromSet);
  }

  function userCheck() {
    USER = site.context.userData2;
    if(USER){
      //C.run('navigate:home');
    }
  }

  function ready(){

    $(document).on('submit', '[data-add-product-to-stripe]', function(e){
      H.stopEvents(e);
      var formData = H.getFormData(this);
      var productTarget = $(this).data('add-product-to-stripe');
      var product = site.context.products[45001276];
      var payload = {
        item_name: formData.item_name,
        description: product.description,
        target: product.target,
        image_file: product.image_file,
        price: product.price,
        target: product.item_id
      };
      C.run('api:createProductInStripe', payload);
    });

    $(document).on('click', '[data-add-variant-to-product]', function(e){
      H.stopEvents(e);
      var productTarget = $(this).data('add-variant-to-product');
      var product = site.context.product[productTarget];
      var variant = {
        image_file: product.image_file,
        item_id: product.item_id,
        qty_avail: product.qty_avail,
        name: product.item_name
      }
      db.collection('products').doc('product').update({
        ['variants.' + product.item_id]: variant
      });
    });

    $(document).on('click', '[data-add-product-to-stripe-parent]', function(e){
      H.stopEvents(e);
      var formData = H.getFormData(this);
      var productTarget = $(this).data('add-product-to-stripe-parent');
      var product = site.context.products[productTarget];
      var payload = {
        item_name: product.item_name,
        description: product.description,
        target: product.target,
        image_file: product.image_file,
        price: product.price,
        target: product.item_id
      };
      C.run('api:createSKUInStripeProduct', payload);
    });

    $(document).on('click', '[data-create-stripe-product]', function(e){
      var target = $(this).data('update-product');
      console.log(target);
      H.stopEvents(e);
      var formData = H.getFormData(this);
      db.collection('products').doc(target.toString()).update(formData);
    });

    $(document).on('click', '[data-update-main-product]', function(e){
      var target = $(this).data('update-main-product');
      console.log(target);
      H.stopEvents(e);
      var formData = H.getFormData(this);
      db.collection('products').doc('product').update(formData);
    });

    $(document).on('submit', '[data-update-variant]', function(e){
      var target = $(this).data('update-variant');
      console.log(target);
      H.stopEvents(e);
      var formData = H.getFormData(this);

      db.collection('products').doc('product').update({
        ['variants.' + target]: formData
      });

    });

    $(document).on('click', '#upload', function(e){
      H.stopEvents(e);
      var csv = $('#file');
      var file = csv[0].files[0];
      const fileToLoad = file
      const reader = new FileReader()
      reader.onload = function(fileLoadedEvent) {
        Papa.parse(fileLoadedEvent.target.result, {
          header: true,
          complete (results) {
            _.each(results.data, function (result) {
              if (result.product_id) {
                const timeStamp = new Date()
                result.dateCreated = timeStamp
                result.dateLastUpdated = timeStamp
                db.collection('products').doc(result.item_id).set(result)
                  .then(function () {
                    console.log(result)
                    console.log('Document successfully written!')
                  })
                  .catch(function (error) {
                    console.error('Error writing document: ', error)
                  })
              }
            })
          },
          error (errors) {
            console.log('error', errors)
          }
        })
      }
      reader.readAsText(fileToLoad)
    });

    $(document).on('submit', '[data-string]', function(e){
      H.stopEvents(e);
      var formData = H.getFormData(this);
      if(!formData.text){
        formData.text = formData.slug;
        $('input[name="text"]').val('');
      }
      formData.slug = convertToSlug(formData.slug).toUpperCase();
      $('input[name="slug"]').val(formData.slug);
      C.run('api:create:string', formData);
    });

    $(document).on('click', '[data-edit-string]', function(e){
      H.stopEvents(e);
      var slug = $(this).data('edit-string');
      var strings = site.context.strings;
      var string = strings[slug];
      const ordered = {};
      Object.keys(string).sort().forEach(function(key) {
        ordered[key] = string[key];
      });
      C.run('modal:open', 'edit-string', {
        string: ordered
      })
    });

    $(document).on('submit', '[data-strings-edit]', function(e){
      H.stopEvents(e);
      var formData = H.getFormData(this);
      console.log(formData);
    })
  }

  function handleImportCardsFromSet(xhr){
    location.reload();
  }

  function convertToSlug(text){
    return text
        .toLowerCase()
        .replace(/[^\w ]+/g,'')
        .replace(/ +/g,'-')
        ;
  }

})(window, window.site, window.jQuery);
