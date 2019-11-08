let orig;
let edited;
let slider;
let oldslider;
const imagepath = 'Images/dog.jpg';

function preload() {
  // Load the image. Save a copy as the original.
  orig = loadImage(imagepath);
  edited = loadImage(imagepath);
}

function setup() {
  createCanvas(orig.width * 2, orig.height);
  slider = createSlider(2, 8, 5, 1);
}

function gen_palette(img, numofcols) {
  // Generate a color palette for the image.
  let depth = Math.ceil(Math.log2(numofcols));
  let kd = KDTreeNode.modifiedPixelsKD(img, depth);
  return kd.averageOfLeaves();
}

function color_dist(c1, c2) {
  // Calculate "distance" between two colors in RGB-space.
  return Math.sqrt(
    (c1[0] - c2[0]) * (c1[0] - c2[0]) +
    (c1[1] - c2[1]) * (c1[1] - c2[1]) +
    (c1[2] - c2[2]) * (c1[2] - c2[2]));
}

function quantize(img, numofcols) {
  // Quantize the colors in an image into *numofcols* colors.
  // E.g., turn a full color png into an 4-bit color with a color palette
  // of 16 colors, chosen using the median cut algorithm.
  img.loadPixels();
  let palette = gen_palette(img, numofcols);

  for (let i = 0; i < img.pixels.length; i += 4) {
    let oldpix = [img.pixels[i], img.pixels[i + 1], img.pixels[i + 2]];
    let minimum = Infinity;
    let closestcol;
    for (let col of palette) {
      let d = color_dist(oldpix, col);
      if (d < minimum) {
        closestcol = col;
        minimum = d;
      }
    }

    let quant_error = [
      closestcol[0] - oldpix[0],
      closestcol[1] - oldpix[1],
      closestcol[2] - oldpix[2]
    ];

    img.pixels[i] = closestcol[0];
    img.pixels[i + 1] = closestcol[1];
    img.pixels[i + 2] = closestcol[2];
  }

  img.updatePixels();
}

function dither(img, numofcols) {
  // Dither an image using Floyd-Steinberg dithering, a process of correcting
  // for quantization error by distributing it on neighboring pixels.
  // Creates more visually pleasing quantized images.

  // Load the image.
  img.loadPixels();

  // Generate a color palette of numofcols colors for the image.
  let palette = gen_palette(img, numofcols);

  // Loop through every pixel in the image.
  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {

      // Retrieve the old pixel with index i
      let i = (x + y * img.width) * 4;
      let oldpix = [img.pixels[i], img.pixels[i + 1], img.pixels[i + 2]];

      // Calculate the closest color in the color palette
      // i.e. minimize distance in RGB-space
      let minimum = Infinity;
      let closestcol;
      let d;
      for (let col of palette) {
        d = color_dist(oldpix, col);
        if (d < minimum) {
          closestcol = col;
          minimum = d;
        }
      }

      // Calculate quantization error.
      let quant_error = [
        oldpix[0] - closestcol[0],
        oldpix[1] - closestcol[1],
        oldpix[2] - closestcol[2]
      ];

      // Set new pixel.
      img.pixels[i] = closestcol[0];
      img.pixels[i + 1] = closestcol[1];
      img.pixels[i + 2] = closestcol[2];

      // Spread quantization error.
      i = ((x + 1) + y * img.width) * 4;
      img.pixels[i] += Math.floor(quant_error[0] * (7 / 16));
      img.pixels[i + 1] += Math.floor(quant_error[1] * (7 / 16));
      img.pixels[i + 2] += Math.floor(quant_error[2] * (7 / 16));

      i = ((x - 1) + (y + 1) * img.width) * 4;
      img.pixels[i] += Math.floor(quant_error[0] * (3 / 16));
      img.pixels[i + 1] += Math.floor(quant_error[1] * (3 / 16));
      img.pixels[i + 2] += Math.floor(quant_error[2] * (3 / 16));

      i = ((x) + (y + 1) * img.width) * 4;
      img.pixels[i] += Math.floor(quant_error[0] * (5 / 16));
      img.pixels[i + 1] += Math.floor(quant_error[1] * (5 / 16));
      img.pixels[i + 2] += Math.floor(quant_error[2] * (5 / 16));

      i = ((x + 1) + (y + 1) * img.width) * 4;
      img.pixels[i] += Math.floor(quant_error[0] * (1 / 16));
      img.pixels[i + 1] += Math.floor(quant_error[1] * (1 / 16));
      img.pixels[i + 2] += Math.floor(quant_error[2] * (1 / 16));
    }
  }

  // Update the image.
  img.updatePixels();
}

function draw() {
  // Loop only if slider is changed (i.e., # of colors)
  if (slider.value() != oldslider) {
    background(50);
    image(orig, 0, 0);

    edited.copy(orig,
      0, 0, orig.width, orig.height,
      0, 0, edited.width, edited.height);

    dither(edited, 32);
    image(edited, edited.width, 0);
    oldslider = slider.value();
  }
}