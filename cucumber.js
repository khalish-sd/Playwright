module.exports = {
    default: {
        paths: ['src/test/features/'],
        require: ['src/test/steps/*.ts', 'src/test/hooks/*.ts'],
        requireModule: ['ts-node/register'],
        format: ['html:reports/cucumber-report.html', 'json:reports/cucumber-report.json']
    }
};