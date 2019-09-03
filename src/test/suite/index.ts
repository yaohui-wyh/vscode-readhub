import * as path from 'path';
import * as Mocha from 'mocha';
import * as glob from 'glob';

export function run(): Promise<void> {
    // Create the mocha test
    const mocha = new Mocha({
        ui: 'tdd',
        timeout: 20 * 1000
    });
    mocha.useColors(true);

    const testsRoot = path.resolve(__dirname, '..');

    return new Promise((c, e) => {
        glob('**/**.test.js', { cwd: testsRoot }, (err, files) => {
            if (err) {
                return e(err);
            }

            // Add files to the test suite
            files.forEach(f => mocha.addFile(path.resolve(testsRoot, f)));

            // Add Mocha test reporters, see .azure-pipelines.yml
            if (process.env.TEST_JUNIT_XML_PATH) {
                mocha.reporter('mocha-multi-reporters', {
                    reporterEnabled: 'mocha-junit-reporter, spec',
                    mochaJunitReporterReporterOptions: {
                        mochaFile: process.env.TEST_JUNIT_XML_PATH,
                        suiteTitleSeparatedBy: ' / ',
                        outputs: true,
                    }
                });
            }


            try {
                // Run the mocha test
                mocha.run(failures => {
                    if (failures > 0) {
                        e(new Error(`${failures} tests failed.`));
                    } else {
                        c();
                    }
                });
            } catch (err) {
                e(err);
            }
        });
    });
}
