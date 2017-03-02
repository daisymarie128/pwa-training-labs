var promiseOfImageName = new Promise(function(resolve, reject) {
  setTimeout(function() {
    if (country === 'Spain' || country === 'Chile' || country === 'Peru') {
      resolve(country + '.png');
    } else {
      reject(Error('Didn\'t receive a valid country name!'));
    }
  }, 1000);
});
console.log(promiseOfImageName);
return promiseOfImageName;
