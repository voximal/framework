$(document).ready(function(){
	$('.repo_boxes').find('input[type=checkbox]').button();
	$('#show_upgradable_only').button();
	$('.repo_boxes').find('input[type=checkbox]').click(function() {
		var id = $(this).attr('id');
		var selected = $(this).prop('checked') ? 1 : 0;
		
		console.log('here');
		$.ajax({
			type: 'POST',
			url: "config.php",
			data: {quietmode: 1, skip_astman: 1, display: "modules", action: "setrepo", "id": id,selected: selected},
			dataType: 'json',
			success: function(data) {
				$('#check_online').fadeIn('fast');
			},
			error: function(data) {
				alert(fpbx.msg.framework.invalid_response);
			}
		});
	})
	$('#show_auto_update').click(function() {
		autoupdate_box = $('#db_online').dialog({
			title: fpbx.msg.framework.updatenotifications,
			resizable: false,
			modal: true,
			position: ['center', 50],
			width: '400px',
			close: function (e) {
				$('#update_email').val($('#update_email').attr('saved-value'));
			},
			open: function (e) {
				$('#update_email').focus();
			},
			buttons: [ {
				text: fpbx.msg.framework.save,
				click: function() {
					if ($('#update_email')[0].validity.typeMismatch) {
						alert(fpbx.msg.framework.bademail + ' : ' + $('#update_email').focus().val());
						$('#update_email').focus();
					} else {
						online_updates = $('[name="online_updates"]:checked').val();
						update_email = $('#update_email').val();
						if (online_updates != 'yes') {
							if (!confirm(fpbx.msg.framework.noupdates)) {
								return false;
							}
						} else if (isEmpty(update_email)) {
							if (!confirm(fpbx.msg.framework.noupemail)) {
								return false;
							}
						}
					$.ajax({
	  					type: 'POST',
	  					url: "config.php",
						data: {quietmode: 1, skip_astman: 1, display: "modules", update_email: update_email, online_updates: online_updates},
	  					dataType: 'json',
	  					success: function(data) {
									if (data.status == true) {
										$('#update_email').attr('saved-value', $('#update_email').val());
										if ($('[name="online_updates"]:checked').val() == 'no') {
											$('#shield_link').attr('class', 'updates_off');
										} else {
											$('#shield_link').attr('class', (isEmpty($('#update_email').val()) ? 'updates_partial' : 'updates_full'));
										}
										autoupdate_box.dialog("close")
									} else {
										alert(data.status)
										$('#update_email').focus();
									}
	  					},
	  					error: function(data) {
									alert(fpbx.msg.framework.invalid_response);
	  					}
					});
					}
				}
			}, {
				text: fpbx.msg.framework.cancel,
				click: function() {
					$(this).dialog("close");
				}
			} ]
		});
	});
	$('.modulevul_tag').click(function(e) {
		e.preventDefault();
		$.each($(this).data('sec'), function(index, value) { 
			$('#security-' + value).dialog({
				title: fpbx.msg.framework.securityissue + ' ' + value,
				resizable: false,
				position: [50+20*index, 50+20*index],
				width: '450px',
				close: function (e) {
				},
				open: function (e) {
				},
				buttons: [ {
					text: fpbx.msg.framework.close,
					click: function() {
						$(this).dialog("close");
					}
				} ]
			});
		});
	});
	$('.moduletrackradios').change(function(e) {
		var track = $(this).find('input:checked').val();
		var module = $(this).parents('.fullmodule').data('module');
		var previous_track = modules[module].track;
		var si = (track == 'stable') ? modules[module] : modules[module].releasetracks[track];
		var pi = (previous_track == 'stable') ? modules[module] : modules[module].releasetracks[previous_track];
		
		$('#fullmodule_'+module+' .moduletrack').html(track.capitalize());
		
		var label = $('#fullmodule_'+module+' .modulestatus').children().text().replace(pi.version,si.version);
		$('#fullmodule_'+module+' .modulestatus').children().text(label);
		
		$('#fullmodule_'+module+' .modulefunctionradios input[type=radio]').each(function( index ) {
			var label = $(this).button('option','label').replace(pi.version,si.version);
			$(this).button('option', 'label', label);
		})
		
		$('#changelog_'+module+' span').html(si.changelog);
		//I dont like this much please improve...someone
		var cl = $('#changelog_'+module+' h5').html().replace(pi.version,si.version);
		$('#changelog_'+module+' h5').html(cl);
		
		modules[module].track = track;
	});
	$('.moduleheader').click(function(e) {
		var module = $(this).data('module');
		if($('#infopane_'+module).is(":visible")) {
			$('#infopane_'+module).slideUp( "slow", function() {
			})
			$('#arrow_'+module).removeClass("fa-chevron-down").addClass("fa-chevron-right");
		} else {
			$('#infopane_'+module).slideDown( "slow", function() {
			})
			$('#arrow_'+module).removeClass("fa-chevron-right").addClass("fa-chevron-down");
			$('#infopane_'+module+' .modulefunctionradios').buttonset();
			$('#infopane_'+module+' .moduletrackradios').buttonset();
		}
	});
	if(!fpbx.conf.AMPTRACKENABLE) {
		$('#modulelist .moduletrack').hide();
	}
})
function check_upgrade_all() {
	$( ".modulefunctionradios :radio" ).each(function( index ) {
		if($(this).val() == 'upgrade') {
			$(this).prop('checked',true);
			$(this).parents('.moduleinfopane').show();
			var module = $(this).parents('.fullmodule').data('module');
			$('#infopane_'+module+' .modulefunctionradios').buttonset();
			$('#infopane_'+module+' .moduletrackradios').buttonset();
		}
	});
}

function check_download_all() {
	$( ".modulefunctionradios :radio" ).each(function( index ) {
		if($(this).val() == 'downloadinstall') {
			$(this).prop('checked',true);
			$(this).parents('.moduleinfopane').show();
			var module = $(this).parents('.fullmodule').data('module');
			$('#infopane_'+module+' .modulefunctionradios').buttonset();
			$('#infopane_'+module+' .moduletrackradios').buttonset();
		}
	});
}

function navigate_to_module(module) {
	if($('#fullmodule_'+module).length) {
		$('#fullmodule_'+module).scrollMinimal(true);
		$('#infopane_'+module).slideDown( "slow", function() {})
		$('#infopane_'+module+' .modulefunctionradios').buttonset();
		$('#infopane_'+module+' .moduletrackradios').buttonset();
	} else {
		alert(module+' does not exist');
	}

}

function showhide_upgrades() {
	var upgradesonly = $('#show_upgradable_only').prop('checked');

	// loop through all modules, check if there is an upgrade_<module> radio box
	if(upgradesonly) {
		$('.fullmodule').hide();
		$('.category').hide();
		$( ".modulefunctionradios :radio" ).each(function( index ) {
			if($(this).val() == 'upgrade') {
				$(this).parents("td").show();
				$(this).parents("div .category").show();
			}
		});
	} else {
		$('.fullmodule').show();
		$('.category').show();
	}

}
var box;
function process_module_actions(modules) {
	var urlStr = '';
	if(!jQuery.isEmptyObject(modules)) {
		urlStr = "config.php?display=modules&skip_astman=1&action=process&quietmode=1&online=1&"+$.param( {"modules":modules} );
	}
	
	box = $('<div id="moduledialogwrapper"></div>')
			.dialog({
				title: 'Status',
				resizable: false,
				modal: true,
				position: ['center', 50],
				width: '410px',
				open: function (e) {
					$('#moduledialogwrapper').html('Loading..<img src="images/spinner.gif">');
				    var xhr = new XMLHttpRequest();
				    xhr.open('POST', urlStr, true);
				    xhr.send(null);
				    var timer;
				    timer = window.setInterval(function() {
				        if (xhr.readyState == XMLHttpRequest.DONE) {
				            window.clearTimeout(timer);
				        }
				        $('#moduledialogwrapper').html(xhr.responseText);
				    }, 100);
				},
				close: function (e) {
					close_module_actions(true);
					$(e.target).dialog("destroy").remove();
				}
			});

}
function close_module_actions(goback) {
	box.dialog("destroy").remove();
	if (goback) {
  		location.href = 'config.php?display=modules';
	}
}

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}