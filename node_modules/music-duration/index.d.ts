declare function musicDuration(filePathOrBuffer: string | Buffer, fileType?: string, cbrEstimate?: boolean): Promise<number>;

export = musicDuration;
