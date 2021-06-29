import { BloomFilter } from './index.js';

class SafeBloomFilter extends BloomFilter {
  constructor(expectedInserts, falsePositiveRate) {
    // @TODO review this with the aim to remove the double static func call.
    super(
      SafeBloomFilter.estimateNumberBits(expectedInserts, falsePositiveRate),
      SafeBloomFilter.optimalNumHashFunctions(expectedInserts,
        SafeBloomFilter.estimateNumberBits(expectedInserts, falsePositiveRate)),
    );
    this.capacity = expectedInserts;
  }

  /**
   * `SafeBloomFilter.estimateNumberOfBits(expectedInserts, falsePositiveRate)`
   * Estimates the number of bits required to store the given number of elements
   * while maintaining the given false positive rate.
   *
   * m = - (n Ln P / (Ln 2)^2)
   *
   * https://en.wikipedia.org/wiki/Bloom_filter
   * https://stackoverflow.com/questions/658439/how-many-hash-functions-does-my-bloom-filter-need
   *
   * @param {Number} expectedInserts -> Expected number of inserts that will be made.
   * @param {Number} falsePositiveRate -> Desired maximum false positive rate.
   * @throws {Error} Invalid false positive rate.
   * @returns {Number} - Number of bits this filter requires.
   */
  static estimateNumberBits(expectedInserts, falsePositiveRate) {
    if (expectedInserts <= 0) {
      return 0;
    }
    if (falsePositiveRate < 0.0 || falsePositiveRate > 1.0) {
      throw new Error('Invalid false positive rate');
    }

    const ln2Sq = Math.LN2 ** 2;
    const nLnP = -expectedInserts * Math.log(falsePositiveRate);
    return Math.ceil(nLnP / ln2Sq);
  }

  /**
   * `SafeBloomFilter.optimalNumHashFunctions(expectedInserts, bits)`
   * Calculates the optimal number of hash functions to minimise the false probability
   * for the given m (size) and n (expectedInserts).
   *
   * k = (m / n) * ln(2).
   *
   * https://en.wikipedia.org/wiki/Bloom_filter
   * https://stackoverflow.com/questions/658439/how-many-hash-functions-does-my-bloom-filter-need
   *
   * @param {Number} expectedInserts -> Expected number of inserts that will be made.
   * @param {Number} bits -> Number of bits used in the filter.
   * @returns {Number} - Number of Hash functions this filter requires.
   */
  static optimalNumHashFunctions(expectedInserts, bits) {
    const min = 1;
    const optimal = (bits / expectedInserts) * Math.LN2;

    if (optimal > min) {
      return Math.ceil(optimal);
    }

    return min;
  }

  /**
   * `bloomFilter.add(key)`
   * Only adds an item to the filter if we are below the capacity of the filter,
   * this avoids increasing the actual error rate of the filter above the desired
   * error rate.
   *
   * @param {String} key -> An item to add to the filter.
   * @throws {Error} Filter at capacity error.
   * @return {BloomFilter} Returns `BloomFilter` for chaining.
   */
  add(key) {
    if (this.inserts < this.capacity) {
      const indices = this.calculateBitIndices(key);

      for (let i = 0; i < indices.length; i += 1) {
        this.bitArray.set(indices[i], 1);
      }

      this.inserts += 1;
    } else {
      throw new Error('Filter at capacity');
    }

    return this;
  }
}

export default SafeBloomFilter;
