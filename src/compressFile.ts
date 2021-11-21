import { unlinkSync, renameSync, createReadStream, createWriteStream } from 'fs';
import { createGzip } from 'zlib';

function compressFile(filename: string): Promise<void> {
    const tempFilename = `${filename}.temp`;

    renameSync(filename, tempFilename);

    const deleteFile = (file: string): void => {
        try {
            unlinkSync(file);
        } catch (_err) {
            /* istanbul ignore next */
        }
    };

    try {
        const read = createReadStream(tempFilename);
        const zip = createGzip();
        const write = createWriteStream(filename);
        read.pipe(zip).pipe(write);

        return new Promise((resolve, reject) => {
            write.on(
                'error',
                /* istanbul ignore next */ err => {
                    // close the write stream and propagate the error
                    write.end();
                    reject(err);
                },
            );
            write.on('finish', () => {
                resolve();
            });
        });
    } catch (err) /* istanbul ignore next */ {
        // in case of an error: remove the output file and propagate the error
        deleteFile(filename);
        throw err;
    } finally {
        // in any case: remove the temp file
        deleteFile(tempFilename);
    }
}

export { compressFile };
