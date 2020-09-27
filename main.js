// $('.navbar-nav a').on('click', function () {
//   $('.navbar-nav').find('li.active').removeClass('active');
//   $(this).parent('li').addClass('active');
// });

$('.navbar-brand').on('click', function () {
  $('.navbar-nav').find('li.active').removeClass('active');
});