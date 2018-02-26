export class Sanitize 
{
    public static sanitizeFileName (name: string): string 
    {
        return name
            .replace(/[\s\W]+/g, '_') // replace whitespaces special characters by single underscore
            .replace(/(^_|_$)/, '');  // remove underscore and start and end
    }

    public static trim( source: string ): string
    {
        return source.replace(/(^ +| +$)/, '');
    }
}