// A leaf node for the k-d tree. Holds a list of points (colors).
class LeafNode {
  constructor(point_list) {
    this.point_list = point_list;
  }

  // Return the average value of the points in this leaf node.
  averageOfLeaves() {
    let ra = 0;
    let ga = 0;
    let ba = 0;
    for (let pt of this.point_list) {
      ra += pt[0];
      ga += pt[1];
      ba += pt[2];
    }
    ra = Math.floor(ra / this.point_list.length);
    ga = Math.floor(ga / this.point_list.length);
    ba = Math.floor(ba / this.point_list.length);

    return [
      [ra, ga, ba]
    ];
  }

  get() {
    return this.point_list;
  }
}

// A k-d tree, or k-dimensional tree, implementation for colors.
// Implements the median cut algorithm for color quantization by
// repeatedly cutting the color space along its median on the axis
// with the largest range, generating *max_depth* buckets of color which can be
// averaged to produce a color palette for an image.
class KDTreeNode {
  constructor(axis, location, left_subtree, right_subtree) {
    this.axis = axis;
    this.location = location;
    this.left_subtree = left_subtree;
    this.right_subtree = right_subtree;
  }

  // Find the range of the specified color of these pixels.
  static range(list, col) {
    let listcol = [];
    let mini = Infinity;
    let maxi = -Infinity;
    for (let l of list) {
      if (l[col] < mini) {
        mini = l[col];
      }
      if (l[col] > maxi) {
        maxi = l[col];
      }
    }
    return maxi - mini;
  }

  // Build a new KDTree from a list of points, up to a max depth.
  // Sort points_list by the axis with the greatest range.
  // Find the median; recursively make a new node with location at median,
  //  left subtree with all points before median, and
  //  right subtree with all points after median.
  // If only one point remains or max depth is exceeded, make a LeafNode.
  static kdtree(point_list, max_depth, depth = 0) {
    if (!point_list) {
      return None;
    }
    if (depth >= max_depth || point_list.length == 1) {
      return new LeafNode(point_list);
    }

    // Determine the maximum range to find the axis to cut
    let max = 0;
    let axis;
    for (let i = 0; i < point_list[0].length; i++) {
      let r = KDTreeNode.range(point_list, i)
      if (r > max) {
        max = r;
        axis = i;
      }
    }

    // Sort by axis and determine the median
    point_list.sort((a, b) => (a[axis] > b[axis]) ? 1 : -1);
    let median = Math.floor(point_list.length / 2);

    return new KDTreeNode(
      axis,
      point_list[median],
      KDTreeNode.kdtree(point_list.slice(0, median), max_depth, depth + 1),
      KDTreeNode.kdtree(point_list.slice(median + 1, point_list.length), max_depth, depth + 1)
    );
  }

  // Generate a KDTreeNode using an image's pixels.
  static pixelsKD(img, max_depth) {
    let point_list = [];
    img.loadPixels();
    for (let i = 0; i < img.pixels.length; i += 4) {
      point_list.push([img.pixels[i], img.pixels[i + 1], img.pixels[i + 2]]);
    }
    return KDTreeNode.kdtree(point_list, max_depth);
  }

  // Recursively calculate and return an array with the average values
  // of the points (colors) in this tree's leaves.
  averageOfLeaves() {
    return this.left_subtree.averageOfLeaves().concat(
      this.right_subtree.averageOfLeaves());
  }

}