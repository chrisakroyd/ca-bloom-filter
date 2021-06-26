import BitVector from 'bit-vec';
import MurMur from 'imurmurhash';

const seedOne = 535345345;
const seedTwo = 312312323;

class BloomFilter {
  constructor(bits, numHashers) {
    this.bits = bits;
    this.k = numHashers;
    this.bitArray = new BitVector(this.bits);
    this.hashOne = new MurMur('', seedOne);
    this.hashTwo = new MurMur('', seedTwo);
    this.inserts = 0;
  }

  /**
   * `bloomFilter.calculateBitIndices(key)`
   * Calculate the indices at which we set the bits to 1 in the bit array.
   * https://willwhim.wordpress.com/2011/09/03/producing-n-hash-functions-by-hashing-only-once/
   *
   * @param {String} key -> Item for which we calculate the bits to set.
   * @returns {Array} Returns an array of indices {0 <= index < this.bits} which need to be set.
   */
  calculateBitIndices(key) {
    const hash1 = this.hashOne.hash(key).result();
    const hash2 = this.hashTwo.hash(key).result();
    const kHashes = [];

    for (let i = 0; i < this.k; i += 1) {
      kHashes.push((hash1 + (i * hash2)) % this.bits);
    }

    this.hashOne.reset(seedOne);
    this.hashTwo.reset(seedTwo);

    return kHashes;
  }

  /**
   * `bloomFilter.add(key)`
   * Adds the given key to the filter and increments the number of inserts.
   *
   * @param {String} key -> An item to add to the filter.
   */
  add(key) {
    const indices = this.calculateBitIndices(key);

    for (let i = 0; i < indices.length; i += 1) {
      this.bitArray.set(indices[i], 1);
    }

    this.inserts += 1;
    return this;
  }

  /**
   * `bloomFilter.contains(key)`
   * Tests whether the key is stored in the filter.
   *
   * @param {String} key -> The item to be tested for filter membership.
   * @returns {Boolean} Returns `true` if the item is contained within the filter, `false` otherwise.
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
   * Tests whether two bloom filters are equivalent. As this is a probabilistic data structure,
   * they are probably equal in contents. There remains a chance that they merely set the same
   * bits with different entries.
   *
   * @param {BloomFilter} bloomFilter -> A bloom filter instance.
   * @returns {Boolean} Returns `true` if the bloom filters are equal (same pattern of 1s and 0s), `false` otherwise.
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
   * @returns {Number} Returns `Number` false positive rate 0.0 <= fpr <= 1.0.
   */
  falsePositiveRate() {
    const rate = (this.bitArray.count() / this.bitArray.bits) ** this.k;
    // Allows for a much easier time during testing to fix it to a certain number of digits.
    return +(rate).toFixed(3);
  }
}

export default BloomFilter;
