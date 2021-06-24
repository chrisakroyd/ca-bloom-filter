import BitVector from 'bit-vec';
import MurMur from 'imurmurhash';

const seedOne = 535345345;
const seedTwo = 312312323;

class BloomFilter {
  constructor(bits, numHashers) {
    this.size = bits;
    this.k = numHashers;
    this.bitArray = new BitVector(this.size);
    this.hashOne = new MurMur('', seedOne);
    this.hashTwo = new MurMur('', seedTwo);
  }

  /**
   * `bloomFilter.calculateBitIndices(key)`
   * Calculate the indices at which we set the bits to 1 in the bit array.
   * https://willwhim.wordpress.com/2011/09/03/producing-n-hash-functions-by-hashing-only-once/
   * @param {String} key
   * @returns {Array}
   */
  calculateBitIndices(key) {
    const hash1 = this.hashOne.hash(key).result();
    const hash2 = this.hashTwo.hash(key).result();
    const kHashes = [];

    for (let i = 0; i < this.k; i += 1) {
      kHashes.push((hash1 + (i * hash2)) % this.size);
    }

    this.hashOne.reset(seedOne);
    this.hashTwo.reset(seedTwo);

    return kHashes;
  }

  /**
   * `bloomFilter.add(key)`
   * Adds the given key to the filter, if all the bits are already set then it doesn't increase the count
   * as it is assumed to be already added to the filter.
   *
   * @param {String} key
   */
  add(key) {
    const indices = this.calculateBitIndices(key);
    let numAlreadySet = 0;

    for (let i = 0; i < indices.length; i += 1) {
      if (this.bitArray.get(indices[i])) {
        numAlreadySet += 1;
      }
      this.bitArray.set(indices[i], 1);
    }

    if (numAlreadySet < indices.length) {
      this.count += 1;
    }
  }

  /**
   * `bloomFilter.contains(key)`
   * Tests whether the given key is already stored in the filter.
   * @param {String} key
   * @returns {Boolean}
   */
  contains(key) {
    const indices = this.calculateBitIndices(key);
    // Check all of the bits for the key, if one of them isn't set then
    // this key is not in the filter and we return false.
    for (let i = 0; i < indices.length; i += 1) {
      if (!this.bitArray.get(indices[i])) {
        return false;
      }
    }
    // If none of the bits checked are false, we return true as the key is in the filter.
    return true;
  }

  /**
   * `bloomFilter.equals(bloomFilter)`
   * Tests whether the given key is already stored in the filter.
   * @param {BloomFilter} bloomFilter
   * @returns {Boolean}
   */
  equals(bloomFilter) {
    return bloomFilter.bitArray.equals(this.bitArray);
  }

  /**
   * `bloomFilter.falsePositiveRate()`
   * Provides an estimate for the false positive rate with the current inserted elements,
   * this will most likely be lower than the expected false positive rate when the filter
   * is not near the its capacity but will trend towards 100% as it fills up.
   *
   * probFalsePositive = (s / m) ^ k
   * s - Number of Bits Set.
   * m - Number of Bits in the Filter
   * k - Number of Hash Functions used.
   *
   * http://ws680.nist.gov/publication/get_pdf.cfm?pub_id=903775
   * http://cglab.ca/~morin/publications/ds/bloom-submitted.pdf
   * @returns {Number}
   */
  falsePositiveRate() {
    const rate = (this.bitArray.count() / this.bitArray.bits) ** this.k;
    // Allows for a much easier time during testing to fix it to a certain number of digits.
    return +(rate).toFixed(3);
  }
}

export default BloomFilter;
