import { expect } from 'chai';
import BloomFilter from '../src/index.js';

const bloomSizeSmall = 32;
const bloomSizeMed = 128;
const bloomSizeLarge = 252;

const numHashSmall = 4;
const numHashMed = 8;
const numHashLarge = 16;

const foo = 'foo';
const bar = 'bar';

describe('BloomFilter tests', () => {
  describe('constructor', () => {
    it('Should create a BloomFilter with the correct length in bits and number of hash functions.', () => {
      const bloomSmall = new BloomFilter(bloomSizeSmall, numHashSmall);
      const bloomMed = new BloomFilter(bloomSizeMed, numHashMed);
      const bloomLarge = new BloomFilter(bloomSizeLarge, numHashLarge);

      expect(bloomSmall.bits).to.equal(bloomSizeSmall);
      expect(bloomSmall.k).to.equal(numHashSmall);

      expect(bloomMed.bits).to.equal(bloomSizeMed);
      expect(bloomMed.k).to.equal(numHashMed);

      expect(bloomLarge.bits).to.equal(bloomSizeLarge);
      expect(bloomLarge.k).to.equal(numHashLarge);
    });
  });

  describe('.calculateBitIndices(key)', () => {
    it('Should calculate an array of indices of the correct length.', () => {
      const bloom = new BloomFilter(bloomSizeMed, numHashMed);

      expect(bloom.calculateBitIndices(foo).length).to.equal(numHashMed);
      expect(bloom.calculateBitIndices(bar).length).to.equal(numHashMed);
    });

    it('Should calculate an array of indices which are within the bounds of the BitArray.', () => {
      const bloom = new BloomFilter(bloomSizeMed, numHashMed);

      const indicesFoo = bloom.calculateBitIndices(foo);
      const indicesBar = bloom.calculateBitIndices(bar);

      expect(indicesFoo.length).to.be.below(bloomSizeMed);
      expect(indicesBar.length).to.be.below(bloomSizeMed);
    });

    it('Should calculate different indices for different elements.', () => {
      const bloom = new BloomFilter(bloomSizeMed, numHashMed);

      const indicesFoo = bloom.calculateBitIndices(foo);
      const indicesBar = bloom.calculateBitIndices(bar);

      expect(indicesFoo).to.not.deep.equal(indicesBar);
    });

    it('Should calculate the same indices for the same element.', () => {
      const bloom = new BloomFilter(bloomSizeMed, numHashMed);

      const indicesFoo = bloom.calculateBitIndices(foo);
      const indicesFooTwo = bloom.calculateBitIndices(foo);

      expect(indicesFoo).to.deep.equal(indicesFooTwo);
    });
  });

  describe('.contains(key)', () => {
    it('Should return False when no items have been added to the filter.', () => {
      const bloom = new BloomFilter(bloomSizeSmall, numHashMed);

      expect(bloom.contains(foo)).to.equal(false);
      expect(bloom.contains(bar)).to.equal(false);
    });

    it('Should return True when an item has been added to the filter.', () => {
      const bloom = new BloomFilter(bloomSizeMed, numHashMed);

      bloom.add(foo);
      expect(bloom.contains(foo)).to.equal(true);
    });

    it('Should return True for all items that have been added to the filter.', () => {
      const bloom = new BloomFilter(bloomSizeMed, numHashMed);

      bloom.add(foo);
      expect(bloom.contains(foo)).to.equal(true);

      bloom.add(bar);
      expect(bloom.contains(bar)).to.equal(true);
    });

    it('Should return False when we test for an item not added to the filter.', () => {
      const bloom = new BloomFilter(bloomSizeMed, numHashMed);

      bloom.add(foo);
      expect(bloom.contains(bar)).to.equal(false);
    });
  });

  describe('.add(key)', () => {
    it('Should add the element to the filter and increment the count to match.', () => {
      const bloom = new BloomFilter(bloomSizeSmall, numHashSmall);

      bloom.add(foo);
      const fooBitsSet = bloom.bitArray.count();
      expect(fooBitsSet).to.be.above(0);

      bloom.add(bar);
      const barBitsSet = bloom.bitArray.count();
      expect(barBitsSet).to.be.above(fooBitsSet);
    });

    it('Should be able to handle the addition of numbers to the filter.', () => {
      const bloom = new BloomFilter(bloomSizeSmall, numHashSmall);

      bloom.add('1');
      expect(bloom.bitArray.count()).to.be.above(0);
    });

    it('Should increment the inserts count with each successful addition.', () => {
      const bloom = new BloomFilter(bloomSizeSmall, numHashSmall);

      bloom.add(foo);
      expect(bloom.inserts).to.equal(1);

      bloom.add(bar);
      expect(bloom.inserts).to.equal(2);
    });

    it('Should set the correct indices in the bit array.', () => {
      const bloom = new BloomFilter(bloomSizeSmall, numHashSmall);

      bloom.add(foo);

      const indices = bloom.calculateBitIndices(foo);

      for (let i = 0; i < indices.length; i += 1) {
        expect(bloom.bitArray.test(indices[i])).to.equal(true);
      }
    });
  });

  describe('.falsePositiveRate()', () => {
    it('Should return a value of 0 when no items have been entered into the filter.', () => {
      const bloom = new BloomFilter(bloomSizeSmall, numHashSmall);

      expect(bloom.falsePositiveRate()).to.equal(0);
    });

    it('Should return a value greater than 0 when an items have been entered into the filter.', () => {
      const bloom = new BloomFilter(bloomSizeSmall, numHashSmall);

      bloom.add(foo);
      bloom.add(bar);
      expect(bloom.falsePositiveRate()).to.be.above(0);
    });

    it('Should return a value greater than the previous when more items are added to the filter.', () => {
      const bloom = new BloomFilter(bloomSizeMed, numHashSmall);

      for (let i = 0; i < bloomSizeMed / 2; i += 1) {
        bloom.add(foo + i);
      }

      const fooPositive = bloom.falsePositiveRate();
      expect(fooPositive).to.be.above(0);
      bloom.add(bar);
      expect(bloom.falsePositiveRate()).to.be.above(fooPositive);
    });
  });
});