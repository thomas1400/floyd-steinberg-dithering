# floyd-steinberg-dithering

A p5.js implementation of Floyd-Steinberg dithering, an interesting image processing algorithm that turns an image with a large color space into an image with a much smaller one by quantizing its colors, then spreading quantization error over neighboring pixels to make otherwise harsh color transitions more visually pleasing.

This implementation uses the median cut algorithm to generate a color palette for the image. The algorithm splits the image's color space at its median along its longest axis. This split generates two buckets of color. It repeats this process on each bucket, producing 4, then 8, and so on, buckets of colors. Upon reaching a maximum number of buckets, specified by the user, it averages the colors in each bucket to produce a set of representative colors for the image's color palette. This implementation achieves the recursive median cut using k-d trees.

Once a color palette has been generated, the dithering algorithm processes each pixel of the image. It determines the appropriate new color for the pixel by minimizing the distance in RGB-space from the pixel's original color to a color on the color palette. The error from this quantization process is spread among neighboring pixels to ease color transitions and more accurately portray the image's original color, leading to a more visually pleasing result than quantization alone.

TO DO:
- Explore other algorithms for optimal color palette generation, including NeuQuant and spatial color quantization.
