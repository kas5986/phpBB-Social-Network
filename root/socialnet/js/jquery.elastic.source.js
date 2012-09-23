/**
 * @name Elastic
 * @descripton Elastic is jQuery plugin that grow and shrink your textareas automatically
 * @version 1.6.11
 * @requires jQuery 1.2.6+
 * 
 * @author Jan Jarfalk
 * @author-email jan.jarfalk@unwrongest.com
 * @author-website http://www.unwrongest.com
 * 
 * @modifiedBy Jan Kalach
 * @modifiedBy-email jankalach@gmail.com
 * @modifiedBy-website http://phpbb3hacks.com
 * @modified Added option to be useable without the ENTER.
 * 
 * 
 * @licence MIT License - http://www.opensource.org/licenses/mit-license.php
 */

(function($) {
	jQuery.fn.extend({
		elastic : function(opts) {

			// We will create a div clone of the textarea by copying these attributes from the textarea to the div.
			var mimics = [ 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'fontSize', 'lineHeight', 'fontFamily', 'width', 'fontWeight', 'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width', 'borderTopStyle', 'borderTopColor', 'borderRightStyle', 'borderRightColor', 'borderBottomStyle', 'borderBottomColor', 'borderLeftStyle', 'borderLeftColor' ];

			var defaults = {
				showNewLine: true,
				useEnter : true,
				enterReplacement : '<br />',
				blur: true
			}

			defaults = $.extend(true, {}, defaults, opts);

			if (!defaults.useEnter) {
				defaults.enterReplacement = '';
			}

			return this.each(function() {

				// Elastic only works on textareas
				if (this.type !== 'textarea') {
					return false;
				}

				// Elastic only works on non initialized objects
				if (jQuery(this).attr('data-elastic') === 'elastic') {
					return false;
				}

				var $textarea = jQuery(this), $twin = jQuery('<div />').css({
					'position' : 'absolute',
					'display' : 'none',
					'word-wrap' : 'break-word',
					'white-space' : 'pre-wrap'
				}), lineHeight = parseInt($textarea.css('line-height'), 10) || parseInt($textarea.css('font-size'), '10'), minheight = parseInt($textarea.css('height'), 10) || lineHeight * 3, maxheight = parseInt($textarea.css('max-height'), 10) || Number.MAX_VALUE, goalheight = 0;

				// Opera returns max-height of -1 if not set
				if (maxheight < 0) {
					maxheight = Number.MAX_VALUE;
				}

				// Append the twin to the DOM
				// We are going to meassure the height of this, not the textarea.
				$twin.appendTo($textarea.parent());

				// Copy the essential styles (mimics) from the textarea to the twin
				var i = mimics.length;
				while (i--) {
					$twin.css(mimics[i].toString(), $textarea.css(mimics[i].toString()));
				}

				// Updates the width of the twin. (solution for textareas with widths in percent)
				function setTwinWidth() {
					var curatedWidth = Math.floor(parseInt($textarea.width(), 10));
					if ($twin.width() !== curatedWidth) {
						$twin.css({
							'width' : curatedWidth + 'px'
						});

						// Update height of textarea
						update(true);
					}
				}

				// Sets a given height and overflow state on the textarea
				function setHeightAndOverflow(height, overflow) {

					var curratedHeight = Math.floor(parseInt(height, 10));
					if ($textarea.height() !== curratedHeight) {
						$textarea.css({
							'height' : curratedHeight + 'px',
							'overflow' : overflow
						});
					}
				}

				// This function will update the height of the textarea if necessary
				function update(forced) {

					var textareaContent = $textarea.val().replace(/&/g, '&amp;').replace(/ {2}/g, '&nbsp;').replace(/<|>/g, '&gt;').replace(/\n/g, defaults.enterReplacement);

					// Compare curated content with curated twin.
					var twinContent = $twin.html().replace(/<br>/ig, '<br />');

					if (forced || textareaContent + '&nbsp;' !== twinContent) {

						// Add an extra white space so new rows are added when you are at the end of a row.
						$twin.html(textareaContent + '&nbsp;');
						// Change textarea height if twin plus the height of one line differs more than 3 pixel from textarea height
						if (  $textarea.attr('data-newline') == 'true' && $textarea.is(':focus'))
							var goalheight = $twin.height()+lineHeight; // Additional line height for textarea
						else
							var goalheight = $twin.height(); // Do not add the additional line height to textarea

						if (Math.abs(goalheight - $textarea.height()) > 3) {

							if (goalheight >= maxheight) {
								setHeightAndOverflow(maxheight, 'auto');
							} else if (goalheight <= minheight) {
								setHeightAndOverflow(minheight, 'hidden');
							} else {
								setHeightAndOverflow(goalheight, 'hidden');
							}

						}

					}

				}

				// Hide scrollbars
				$textarea.css({
					'overflow' : 'hidden'
				});

				// Update textarea size on keyup, change, cut and paste
				$textarea.bind('keyup cut paste', function(event) {
					if ( $.isFunction($textarea.eventBlur) && !$textarea.eventBlur(event)) return;
					if ( !$.isFunction($textarea.eventBlur) && !$textarea.eventBlur) return;
					update(true);
				});

				// Update width of twin if browser or textarea is resized (solution for textareas with widths in percent)
				$(window).live('resize', setTwinWidth);
				$textarea.live('resize', setTwinWidth);
				$textarea.live('update', update);
				$textarea.live('focusin', update);
				$textarea.attr('data-newline', defaults.showNewLine);
				$textarea.eventBlur = defaults.blur;

				// Compact textarea on blur
				$textarea.bind('blur', function(event) {
					if ( $.isFunction($textarea.eventBlur) && !$textarea.eventBlur(event)) return;
					if ( !$.isFunction($textarea.eventBlur) && !$textarea.eventBlur) return;
					if ($twin.height() < maxheight) {
						if ($twin.height() > minheight) {
							$textarea.height($twin.height());
						} else {
							$textarea.height(minheight);
						}
					}
				});

				// And this line is to catch the browser paste event
				$textarea.bind('input paste', function(e) {
					setTimeout(update, 250);
				});

				$textarea.attr('data-elastic', 'elastic');
				// Run update once when elastic is initialized
				update(true);

			});

		}
	});
})(jQuery);