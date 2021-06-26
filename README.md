# ca-bloom-filter

[![Coverage Status](https://coveralls.io/repos/github/chrisakroyd/ca-bloom-filter/badge.svg?branch=main)](https://coveralls.io/github/chrisakroyd/bit-vec?branch=main)
[![npm version](https://badge.fury.io/js/ca-bloom-filter.svg)](https://badge.fury.io/js/ca-bloom-filter)
![npm](https://img.shields.io/npm/dm/ca-bloom-filter)

A lightweight, performant bloom filter implementation with a simple API.

## Installing
Via NPM: `npm install ca-bloom-filter --save`.

## Getting Started

After installing
```js
import BloomFilter from 'ca-bloom-filter';

const bloomFilter = new BloomFilter(8);
```

Example Usage:


```js
import BloomFilter from 'ca-bloom-filter';

const bloomFilter = new BloomFilter(8);

bloom.contains('cheese'); // false
bloom.add('cheese');
bloom.contains('cheese'); // true
```

## Condensed Documentation

Below is a condensed form of the documentation, each is a function that can be found on the BloomFilter object, called like so.

```js
const bloom = new BloomFilter(42);
bloom.contains('cheese'); // false
bloom.add('cheese');
bloom.contains('cheese'); // true
```


| Method | Parameters | Return |
| ----------- | -------- | ------ |
| [.add(key)](#add) | `key:String` | Returns `BloomFilter` for chaining. |
| [.contains(key)](#contains) | `key:String` | Returns `true` if the item is within the filter, `false` otherwise. |
| [.equals(bloomFilter)](#equals) | `bloomFilter:BloomFilter` | Returns `true` if the bloom filters are equal (same pattern of 1s and 0s), `false` otherwise.|
| [.falsePositiveRate()](#falsepositiverate) | `None` |  Returns `Number` false positive rate 0.0 <= fpr <= 1.0. |
| [.calculateBitIndices(key)](#calculatebitindices) | `key:String` | Returns an array of indices {0 <= index < this.bits} which need to be set. |

## Full Documentation

---

### add
`bloomFilter.add(key)`

Adds the given key to the filter and increments the number of inserts.

##### Parameters
* key -> An item to add to the filter.

##### Returns
Returns `BloomFilter` for chaining.

##### Example

```js
bloomFilter.add('cheese');
```

---

### contains
`bloomFilter.contains(key)`

Tests whether the key is stored in the filter.

##### Parameters
* key -> The item to be tested for filter membership.

##### Returns
Returns `true` if the item is within the filter, `false` otherwise.

##### Example

```js
bloomFilter.contains('cheese');
```

---

### equals
`bloomFilter.equals(bloomFilter)`

Tests whether the key is stored in the filter.

##### Parameters
* bloomFilter -> A bloom filter instance.

##### Returns
Returns `true` if the bloom filters are equal (same pattern of 1s and 0s), `false` otherwise.

##### Example

```js
bloomFilter.equals(otherBloom);
```

---

### falsePositiveRate
`bloomFilter.falsePositiveRate()`
Provides an estimate for the false positive rate with the current inserted elements.
This will most likely be lower than the expected false positive rate when the filter
is not near the capacity but will trend towards 100% as it fills up.

probFalsePositive = (s / m) ^ k

s - Number of Bits Set.

m - Number of Bits in the Filter

k - Number of Hash Functions used.

http://ws680.nist.gov/publication/get_pdf.cfm?pub_id=903775
http://cglab.ca/~morin/publications/ds/bloom-submitted.pdf

##### Parameters
* None

##### Returns
Returns `Number` false positive rate 0.0 <= fpr <= 1.0.

##### Example

```js
bloomFilter.falsePositiveRate();
```

------

### calculateBitIndices
`bloomFilter.calculateBitIndices(key)`

Calculate the indices at which we set the bits to 1 in the bit array.
https://willwhim.wordpress.com/2011/09/03/producing-n-hash-functions-by-hashing-only-once/

##### Parameters
* key -> Item for which we calculate the bits to set.

##### Returns
Returns an array of indices {0 <= index < this.bits} which need to be set.

##### Example

```js
bloomFilter.equals(otherBloom);
```

---

# License
See [LICENSE](https://github.com/ChrisAkroyd/ca-bloom-filter/blob/master/LICENSE) file.

# Resources

* [Bloom Filter Overview](https://en.wikipedia.org/wiki/Bloom_filter)
