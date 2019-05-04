/* global $ */
'use strict';

(function (window, site) {

  var H = site.helpers;
  var C = site.commands;
  var E = site.events;
  var PRODUCTS = site.context.products;
  var db = firebase.firestore();

  preDomReady();

  function preDomReady(){
    initEvents();
  }

  function initEvents(){
    E.on('global:ready', ready);
    E.on('modal:did-open:shipping-same-as-billing', initShippingCheckModalUI);
  }

  function ready () {
    //when the element with data-activate-variant is clicked
    $(document).on('click', '[data-activate-variant]', function(e){
      H.stopEvents(e);
      //get the value of the this data-activate-variant
      var productTarget = $(this).data('activate-variant');
      //get the product object from contect
      site.context.activeVariant = site.context.product.variants[productTarget];
      //build the template for active product passing the product object
      var template = H.renderPartial('active-product');
      //replace the html content of the '.products-active-product' element with the new template
      $('.products-active-product').html(template);
      H.scrollToTop();
    })

    //when the 'data-init-checkout-flow' element is clicked
    $(document).on('click', '[data-init-checkout-flow]', function(e){
      H.stopEvents(e);
      //TODO ask user if their shipping address is the same as
      //run the shipping same as billing modal
      C.run('modal:open', 'shipping-same-as-billing');
    });

    //when the #qty input is incremented update the prices
    $(document).on('keyup mouseup', '#qty', function(e){
      //get the value of the input as a number
      var val = parseInt($('#qty').val());
      var product = getActiveProduct();
      //update the html for the new updated number after being rounded to the nearest hundreth
      $('[data-target="orgPrice"]').html('$' + roundToNearestHundreth(product.msrp*val));
      $('[data-target="price"]').html('$' + roundToNearestHundreth(product.price*val));
    });
  }

  //init when the 'shipping-same-as-billing' modal is opened
  function initShippingCheckModalUI() {
    $('.modal').on('submit', '[data-form="shipping-address-form"]', function(e){
      H.stopEvents(e);
      var formData = H.getFormData(this);
      var product = site.context.product;
      var activeVariant = getActiveProduct();
      formData.orderTotal = product.price*parseInt($('#qty').val());
      formData.orderOrgPrice = product.msrp*parseInt($('#qty').val());
      formData.variant = activeVariant;
      formData.skuId = activeVariant.stripkeSKU;
      formData.shippingSameAsBilling= false;
      createOrder(formData);
    });

    $('.modal').on('change', '#billingSameAsShipping',function(e){
      if(!$(this).prop('checked')){
        $('.billing-form-container').show();
      } else {
        $('.billing-form-container').hide();
      }
    });
  };

  //this function will take a payload and create a order out of it
  function createOrder(payload){
    //set the current time as the createdAt time
    payload.createdAt = new Date($.now());
    //get the quantity of items being sold
    payload.qty = $('#qty').val();
    //create the order in firestore
    db.collection('orders').add(payload)
      .then(function(doc){
        //send the newly created orderId to the initStripeCheckout function
        intStripeCheckOut(doc.id);
      })
      .catch(function(e){
        console.log('error' + e);
      });
  };

  //this function will take the value of data-active-product,
  //then return that product from the context
  function getActiveProduct(){
    var activeProduct = $('[data-active-product]').data('active-product');
    return site.context.activeVariant;
  }

  //this function will initiate the stripe checkout flow
  //requires orderId
  function intStripeCheckOut(orderId){
    //get the sku of the item to be ordred
    var stripeSKU = $(this).data('init-checkout-flow');
    //get the active product
    var product = getActiveProduct();
    //init stripe
    var stripe = Stripe('pk_test_9zTgVGnh5lp27tRAdf0DDSkO');
    //get the quantity of items to be ordred
    var qty = $('#qty').val();
    //set the base url for the resposne from stripe
    //expect default is remote
    //if its actually local point response url to local api
    var location = 'https://us-central1-backpacks-5bda5.cloudfunctions.net/handleStripePaymentResponse?location=remote';
    if(window.location.hostname == 'localhost'){
      location = 'http://localhost:5001/backpacks-5bda5/us-central1/handleStripePaymentResponse?location=localhost'
    }
    //stripe promise
    stripe.redirectToCheckout({
      items: [{sku: product.stripkeSKU, quantity: parseInt(qty)}],
      // Note that it is not guaranteed your customers will be redirected to this
      // URL *100%* of the time, it's possible that they could e.g. close the
      // tab between form submission and the redirect.
      //add a q param to the call with the user id? or order ID? so I can know what happened in the thing
      successUrl: location + '&orderId='+orderId+'&success=true',
      cancelUrl: location + '&orderId='+orderId+'&success=false',
    })
    .then(function (result) {
      if (result.error) {
        // If `redirectToCheckout` fails due to a browser or network
        // error, display the localized error message to your customer.
        var displayError = document.getElementById('error-message');
        displayError.textContent = result.error.message;
      }
    });
  };

  //this function will take a number and will return it rounded to the nearest hundreth
  function roundToNearestHundreth(x){
    return (x).toFixed(2);
  }

})(window, window.site, window.jQuery);
