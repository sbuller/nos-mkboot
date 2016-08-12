const buildtlb = require('nos-tlb')
const initify = require('nos-init')
const fs = require('fs')

function barebones() {
	return fs.createReadStream(`${__dirname}/nodeos/barebones`)
}

function buildDisk(initSrc, cb) {
	let fin
	let bb = barebones()
	return initify(initSrc).then(init=>{
		return buildtlb(bb, init, cb)
	})
}

module.exports = buildDisk

if (require.main === module) {
	let cb
	let target = process.argv[2]
	target = target || './'

	let dest = process.argv[3]

	if (!dest) {
		dest = process.stdout
		cb = (_, initsize)=>{
			let buffer = Buffer.alloc(4)
			buffer.writeUInt32LE(initsize)
			console.error("The streamed disk image needs the 32bit little-endian value at 0x1bd changed to", buffer.toString('hex'))
		}
	} else {
		let file = fs.openSync(dest, 'w')
		dest = fs.createWriteStream(null, {fd: file})
		cb = finisher=>finisher(file)
	}
	buildDisk(target, cb).then(disk=>{
		disk.pipe(dest)
	})
}
