function linkDebounce(selector='a[data-cy-documentid]', delay = 3000) {
  /**
   *  Adds a debounce of a given duration to links such as document download links
   *  @param selector css selector for the links to be debounced
   *  @param delay the period that second clicks will be disabled, in ms
   * */
  $(selector).each(function () {
    let quench = false
    const el = $(this)
    el.on('click', function (e) {
      if (quench) {
        e.preventDefault()
      } else {
        quench = true
        el.addClass('link-disabled')
        window.setTimeout(function () {
          el.removeClass('link-disabled')
          quench = false
        }, delay)
      }
    })
  })
}
