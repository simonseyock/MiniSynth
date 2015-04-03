var findNearest = function (array_, value, start, end) {
  if (end-start > 1) {
    var middle = start + Math.floor((end-start)/2);
    if (value <= array_[middle]) {
      return findNearest(array_, value, start, middle);
    } else {
      return findNearest(array_, value, middle, end);
    }
  } else if (end-start === 1) {
    if (value - array_[start] < array_[end] - value) {
      return start;
    } else {
      return end;
    }
  } else {
    return start;
  }
};

anArray = [0,1,2,3,4,5,6];
console.log(findNearest(anArray, 3.3, 0, 6));