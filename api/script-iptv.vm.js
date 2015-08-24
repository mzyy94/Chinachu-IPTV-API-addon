(function() {
	
	switch (request.type) {
		/*- channnel.m3u8 -*/
		case 'm3u8': // channel playlist 
			var tlsEnabled = !!config.wuiTlsKeyPath && !!config.wuiTlsCertPath;
			var protocol = tlsEnabled ? 'https' : 'http';
			
			response.head(200);
			response.write('#EXTM3U\n');
			data.schedule.forEach(function(ch) {
				response.write('#EXTINF:-1 tvg-id="' + ch.id + '",' + ch.name + '\n');
                                // Pass BASIC authentication
                                if (!!config.wuiUsers && config.wuiUsers.length > 0) {
                                        response.write(protocol + '://' + config.wuiUsers[0] + '@' + request.headers.host + '/api/channel/' + ch.id + '/watch.m2ts?ext=m2ts&c%3Av=copy&c%3Aa=copy\n');
                                } else {
                                        response.write(protocol + '://' + request.headers.host + '/api/channel/' + ch.id + '/watch.m2ts?ext=m2ts&c%3Av=copy&c%3Aa=copy\n');
                                }
			});
			
			response.end();
			return;
		/* epg.xml */
		case 'xml': // epg xmltv
			var tz = new Date().toString().replace(/^.*GMT([+-]\d{4}).*$/,' $1');
			function getTimeString(sec) {
				var date = new Date(sec);
				var yyyy = date.getFullYear();
				var MM = ('0' + (date.getMonth()+1)).slice(-2);
				var dd = ('0' + date.getDate()).slice(-2);
				var HH = ('0' + date.getHours()).slice(-2);
				var mm = ('0' + date.getMinutes()).slice(-2);
				var ss = ('0' + date.getSeconds()).slice(-2);
				
				return '' + yyyy + MM + dd + HH + mm + ss + tz;
			}
			
			response.head(200);
			
			response.write('<?xml version="1.0" encoding="UTF-8"?>\n');
			response.write('<!DOCTYPE tv SYSTEM "xmltv.dtd">\n');
			response.write('<tv generator-info-name="Chinachu">\n');
			data.schedule.forEach(function(ch) {
				response.write('  <channel id="' + ch.id + '" tp="' + ch.channel + '">\n');
				response.write('    <display-name lang="ja_JP">' + ch.name + '</display-name>\n');
				response.write('    <service_id>' + ch.sid + '</service_id>\n');
				response.write('  </channel>\n');
				ch.programs.forEach(function(prog) {
					response.write('  <programme start="' + getTimeString(prog.start) + '" stop="' + getTimeString(prog.end) + '" channel="' + prog.channel.id + '" event_id="' + prog.id + '">\n');
					response.write('    <title lang="ja_JP">' + prog.fullTitle.replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/&/g, '&amp;') + '</title>\n');
					response.write('    <desc lang="ja_JP">' + prog.detail.replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/&/g, '&amp;') + '</desc>\n');
					response.write('    <category lang="ja_JP">' + prog.category + '</category>\n');
					response.write('    <category lang="en">' + prog.category + '</category>\n');
					response.write('  </programme>\n');
				});
			});
			response.write('</tv>');
			
			response.end();
			return;
	}

})();
