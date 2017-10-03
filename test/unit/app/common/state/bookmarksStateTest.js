/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

/* global describe, it */
const assert = require('assert')
const Immutable = require('immutable')
const siteTags = require('../../../../../js/constants/siteTags')

require('../../../braveUnit')
const bookmarksState = require('../../../../../app/common/state/bookmarksState')

const stateWithData = Immutable.fromJS({
  windows: [],
  bookmarks: {
    'https://brave.com/|0|0': {
      favicon: undefined,
      title: 'Brave',
      location: 'https://brave.com/',
      key: 'https://brave.com/|0|0',
      parentFolderId: 0,
      partitionNumber: 0,
      objectId: null,
      themeColor: undefined,
      type: siteTags.BOOKMARK
    },
    'https://clifton.io/|0|0': {
      favicon: undefined,
      title: 'Clifton',
      location: 'https://clifton.io/',
      key: 'https://clifton.io/|0|0',
      parentFolderId: 0,
      partitionNumber: 0,
      objectId: null,
      themeColor: undefined,
      type: siteTags.BOOKMARK
    }
  },
  bookmarkFolders: {},
  cache: {
    bookmarkOrder: {
      '0': [
        {
          key: 'https://brave.com/|0|0',
          order: 0,
          type: siteTags.BOOKMARK
        },
        {
          key: 'https://clifton.io/|0|0',
          order: 1,
          type: siteTags.BOOKMARK
        }
      ]
    },
    bookmarkLocation: {
      'https://brave.com/': [
        'https://brave.com/|0|0'
      ],
      'https://clifton.io/': [
        'https://clifton.io/|0|0'
      ]
    }
  },
  historySites: {},
  tabs: []
})

describe('bookmarkState unit test', function () {
  describe('updateFavicon', function () {
    it('updates the favicon for all matching entries', function () {
      const processedState = bookmarksState.updateFavicon(stateWithData, 'https://brave.com/', 'https://brave.com/favicon.ico')
      assert.equal(processedState.getIn(['bookmarks', 'https://brave.com/|0|0', 'favicon']), 'https://brave.com/favicon.ico')
    })
    it('returns the state unchanged if location is not a URL', function () {
      const processedState = bookmarksState.updateFavicon(stateWithData, 'not-a-url', 'https://brave.com/favicon.ico')
      assert.deepEqual(processedState.get('bookmarks'), stateWithData.get('bookmarks'))
    })
    it('throws an error if bookmarks are not an Immutable.Map', function () {
      const emptyLegacySites = Immutable.fromJS({
        bookmarks: []
      })
      assert.throws(
        () => {
          bookmarksState.updateFavicon(emptyLegacySites, 'https://brave.com/', 'https://brave.com/favicon.ico')
        },
        /state must contain an Immutable.Map of bookmarks/,
        'did not throw with expected message')
    })
    it('returns the state unchanged if key is not found in sites', function () {
      const processedState = bookmarksState.updateFavicon(stateWithData, 'https://not-in-sites.com', 'https://brave.com/favicon.ico')
      assert.deepEqual(processedState.get('bookmarks'), stateWithData.get('bookmarks'))
    })
    it('works even if null/undefined entries are present', function () {
      const stateWithInvalidEntries = stateWithData.mergeDeep(Immutable.fromJS({
        'bookmarks': {
          'null': null,
          'bubba': 'a'
        }
      }))
      const processedState = bookmarksState.updateFavicon(stateWithInvalidEntries, 'https://brave.com/', 'https://brave.com/favicon.ico')
      assert.equal(processedState.getIn(['bookmarks', 'https://brave.com/|0|0', 'favicon']), 'https://brave.com/favicon.ico')
    })
    it('returns the object unchanged if the entry does not exist but found in cache', function () {
      const testUrl = 'https://brave.com'
      const stateWithNoEntries = Immutable.fromJS({
        bookmarks: {},
        cache: {
          bookmarkLocation: {
            'https://brave.com': [
              testUrl + '/|0|0', testUrl + '|0|0'
            ]
          }
        }
      })
      const processedState = bookmarksState.updateFavicon(stateWithNoEntries, testUrl, 'https://brave.com/favicon.ico')
      const expectedState = stateWithNoEntries
      assert.deepEqual(processedState.get('bookmarks').toJS(), expectedState.get('bookmarks').toJS())
    })
  })

  describe('getBookmarksByParentId', function () {
    it('null case', function () {
      const result = bookmarksState.getBookmarksByParentId(stateWithData)
      assert.equal(result, Immutable.List())
    })

    it('cache is empty', function () {
      const state = Immutable.fromJS({
        windows: [],
        bookmarks: {},
        bookmarkFolders: {},
        cache: {
          bookmarkOrder: {},
          bookmarkLocation: {}
        },
        historySites: {},
        tabs: []
      })

      const result = bookmarksState.getBookmarksByParentId(state, 1)
      assert.deepEqual(result, Immutable.List())
    })

    it('bookmarks are returned', function () {
      const result = bookmarksState.getBookmarksByParentId(stateWithData, 0)
      assert.deepEqual(result, Immutable.fromJS([
        {
          favicon: undefined,
          title: 'Brave',
          location: 'https://brave.com/',
          key: 'https://brave.com/|0|0',
          parentFolderId: 0,
          partitionNumber: 0,
          objectId: null,
          themeColor: undefined,
          type: siteTags.BOOKMARK
        },
        {
          favicon: undefined,
          title: 'Clifton',
          location: 'https://clifton.io/',
          key: 'https://clifton.io/|0|0',
          parentFolderId: 0,
          partitionNumber: 0,
          objectId: null,
          themeColor: undefined,
          type: siteTags.BOOKMARK
        }
      ]))
    })
  })
})
