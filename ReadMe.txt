Edit the node module easyZip/easyZip.js lines 118 fuction 


EasyZip.prototype.writeToFile = function(filePath,callback){
		let data = this.generate({base64:false,compression:'DEFLATE'});
		fs.writeFile(filePath, data, 'binary',callback);
}

to

EasyZip.prototype.writeToFile = function(filePath,callback){
		let data = this.generate({base64:false,compression:'DEFLATE'});
		fs.writeFile(filePath, data, function(err, result) {
			if(err) console.log('error', err);
		  });
}


install msexcel-builder-colorfix npm lib