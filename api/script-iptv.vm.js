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
				response.write(protocol + '://' + request.headers.host + '/api/channel/' + ch.id + '/watch.m2ts?ext=m2ts&c%3Av=copy&c%3Aa=copy\n');
			});
			
			response.end();
			return;
		/* epg.xml */
		case 'xml': // epg xmltv
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
					var startDate = new Date(prog.start).toISOString().replace(/([-T:]|\..*$)/g,'');
					var endDate = new Date(prog.end).toISOString().replace(/([-T:]|\..*$)/g,'');
					response.write('  <programme start="' + startDate + ' +0000" stop="' + endDate + ' +0000" channel="' + prog.channel.id + '" event_id="' + prog.id + '">\n');
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
