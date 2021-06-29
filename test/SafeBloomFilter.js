import { expect } from 'chai';
import SafeBloomFilter from '../src/SafeBloomFilter.js';

const noInserts = 0;

const expectedInsertsSmall = 1000;
const expectedInsertsMed = 15000;
const expectedInsertsLarge = 1000000;

const fpRateLow = 0.01;
const fpRateHigh = 0.2;
const fpRateErrorLow = -4.0;
const fpRateErrorHigh = 2.0;

const foo = 'foo';
const bar = 'bar';

describe('SafeBloomFilter', () => {
  describe('constructor', () => {
    it('Should create a BloomFilter with the correct length.', () => {
      const bloom = new SafeBloomFilter(expectedInsertsLarge, fpRateHigh);

      expect(bloom.bitArray.bits).to.be.closeTo(SafeBloomFilter.estimateNumberBits(expectedInsertsLarge, fpRateHigh), 8);
    });

    it('Should create a BloomFilter with the correct number of hash functions.', () => {
      const bloom = new SafeBloomFilter(expectedInsertsLarge, fpRateHigh);

      const numBits = SafeBloomFilter.estimateNumberBits(expectedInsertsLarge, fpRateHigh);
      expect(bloom.k).to.equal(SafeBloomFilter.optimalNumHashFunctions(expectedInsertsLarge, numBits));
    });

    it('Should initialise the capacity to the correct value.', () => {
      const bloomSmall = new SafeBloomFilter(expectedInsertsMed, fpRateLow);
      const bloomLarge = new SafeBloomFilter(expectedInsertsLarge, fpRateHigh);

      expect(bloomSmall.capacity).to.equal(expectedInsertsMed);
      expect(bloomLarge.capacity).to.equal(expectedInsertsLarge);
    });
  });

  describe('.estimateNumberBits(key)', () => {
    it('Should throw an error for a value greater than 1 and less than 0.', () => {
      expect(() => SafeBloomFilter.estimateNumberBits(expectedInsertsLarge, fpRateErrorLow)).to.throw();
      expect(() => SafeBloomFilter.estimateNumberBits(expectedInsertsMed, fpRateErrorHigh)).to.throw();
    });

    it('Should return a value of 0 for a capacity of 0.', () => {
      expect(SafeBloomFilter.estimateNumberBits(noInserts, noInserts)).to.equal(noInserts);
    });

    it('Should return a non-negative value.', () => {
      expect(SafeBloomFilter.estimateNumberBits(noInserts, fpRateLow)).to.be.above(-1);
      expect(SafeBloomFilter.estimateNumberBits(expectedInsertsMed, fpRateLow)).to.be.above(-1);
      expect(SafeBloomFilter.estimateNumberBits(expectedInsertsLarge, fpRateHigh)).to.be.above(-1);
    });

    it('Should return a positive value greater than 0 for a capacity greater than 0.', () => {
      expect(SafeBloomFilter.estimateNumberBits(expectedInsertsMed, fpRateLow)).to.be.above(0);
      expect(SafeBloomFilter.estimateNumberBits(expectedInsertsMed, fpRateHigh)).to.be.above(0);
      expect(SafeBloomFilter.estimateNumberBits(expectedInsertsLarge, fpRateLow)).to.be.above(0);
      expect(SafeBloomFilter.estimateNumberBits(expectedInsertsLarge, fpRateHigh)).to.be.above(0);
    });

    it('Should return a different value for greatly differing capacities at different fp rates.', () => {
      const smallLowBloom = SafeBloomFilter.estimateNumberBits(expectedInsertsMed, fpRateLow);
      const smallHighBloom = SafeBloomFilter.estimateNumberBits(expectedInsertsMed, fpRateHigh);
      const largeLowBloom = SafeBloomFilter.estimateNumberBits(expectedInsertsLarge, fpRateLow);
      const largeHighBloom = SafeBloomFilter.estimateNumberBits(expectedInsertsLarge, fpRateHigh);

      expect(smallLowBloom).to.not.be.oneOf([smallHighBloom, largeLowBloom, largeHighBloom]);
      expect(smallHighBloom).to.not.be.oneOf([smallLowBloom, largeLowBloom, largeHighBloom]);
      expect(largeLowBloom).to.not.be.oneOf([smallLowBloom, smallHighBloom, largeHighBloom]);
      expect(largeHighBloom).to.not.be.oneOf([smallLowBloom, smallLowBloom, largeLowBloom]);
    });

    it('Should return a different number of bits for different capacities.', () => {
      const bitsLow = SafeBloomFilter.estimateNumberBits(expectedInsertsLarge, fpRateLow);
      const bitsHigh = SafeBloomFilter.estimateNumberBits(expectedInsertsLarge, fpRateHigh);

      expect(bitsLow).to.not.equal(bitsHigh);
    });


    it('Should return a larger number of bits for the lower false positive rate.', () => {
      const bitsLow = SafeBloomFilter.estimateNumberBits(expectedInsertsLarge, fpRateLow);
      const bitsHigh = SafeBloomFilter.estimateNumberBits(expectedInsertsLarge, fpRateHigh);

      expect(bitsLow).to.be.above(bitsHigh);
    });
  });

  describe('.optimalNumHashFunctions(key)', () => {
    const bitsFpLow = SafeBloomFilter.estimateNumberBits(expectedInsertsLarge, fpRateLow);
    const bitsFpHigh = SafeBloomFilter.estimateNumberBits(expectedInsertsLarge, fpRateHigh);

    it('Should return a the min value of 1 for a 0 capacity.', () => {
      expect(SafeBloomFilter.optimalNumHashFunctions(0, 0)).to.equal(1);
      expect(SafeBloomFilter.optimalNumHashFunctions(-3646, 48)).to.equal(1);
    });

    it('Should return a value greater than 1 for different given capacities.', () => {
      expect(SafeBloomFilter.optimalNumHashFunctions(expectedInsertsLarge, bitsFpLow)).to.be.above(1);
      expect(SafeBloomFilter.optimalNumHashFunctions(expectedInsertsLarge, bitsFpHigh)).to.be.above(1);
    });

    it('Should return a higher optimal number of hash functions for a lower false positive rate.', () => {
      const hashFpLow = SafeBloomFilter.optimalNumHashFunctions(expectedInsertsLarge, bitsFpLow);
      expect(SafeBloomFilter.optimalNumHashFunctions(expectedInsertsLarge, bitsFpHigh)).to.be.below(hashFpLow);
    });

    it('Should return a different number for vastly different capacities and sizes.', () => {
      const smallCapacity = SafeBloomFilter.optimalNumHashFunctions(expectedInsertsSmall, SafeBloomFilter.estimateNumberBits(expectedInsertsSmall, fpRateHigh));
      expect(SafeBloomFilter.optimalNumHashFunctions(expectedInsertsLarge, bitsFpLow)).to.not.equal(smallCapacity);
    });

    it('Should return a greater number for a lower desired false positive rate.', () => {
      const largeNumHashes = SafeBloomFilter.optimalNumHashFunctions(expectedInsertsLarge, bitsFpLow);
      expect(SafeBloomFilter.optimalNumHashFunctions(expectedInsertsLarge, bitsFpHigh)).to.be.below(largeNumHashes);
    });
  });

  describe('.add(key)', () => {
    it('Should correctly add an item to the bloom filter.', () => {
      const bloom = new SafeBloomFilter(expectedInsertsLarge, fpRateHigh);
      bloom.add(foo);
      bloom.add(bar);

      expect(bloom.contains(foo)).to.equal(true);
      expect(bloom.contains(bar)).to.equal(true);

      expect(bloom.inserts).to.equal(2);
      expect(bloom.bitArray.count()).to.be.above(0);
    });

    it('Should not add an item to the filter when it is above the capacity.', () => {
      const bloom = new SafeBloomFilter(expectedInsertsSmall, fpRateLow);

      // Fill the filter up to capacity.
      let i = 0;
      while (bloom.inserts < expectedInsertsSmall) {
        bloom.add(foo + i);
        i += 1;
      }

      expect(() => bloom.add(foo)).to.throw();
    });
  });

  describe('.falsePositiveRate()', () => {
    it('Should return a value less than or equal to the desired false probability rate when at the desired capacity.', () => {
      const bloom = new SafeBloomFilter(expectedInsertsMed, fpRateLow);

      // Fill the filter up to capacity.
      for (let i = 0; i < expectedInsertsMed; i += 1) {
        bloom.add(foo + i);
      }

      expect(bloom.falsePositiveRate()).to.be.at.most(fpRateLow);
    });
  });
});
