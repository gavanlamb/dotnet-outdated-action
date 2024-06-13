import {
    getBooleanInput,
    getStringArrayInput,
    getStringInput
} from "../helpers/inputHelper";
import {
    getExecOutput
} from "@actions/exec";
import {
    Configuration
} from "../types/configuration";
import {
    debug
} from "@actions/core";

/**
 * Gets the packages-to-exclude argument from the action
 * @returns --exclude {packages} if the argument is set.
 */
function getTargetArgument(): string {
    const value = getStringInput('target');
    if (value)
        return value;
    return '';
}

/**
 * Gets the include-transitive-dependencies argument from the action.
 * @returns --include-transitive if the argument is true.
 */
function getIncludeTransitiveDependenciesArgument(): string {
    const value = getBooleanInput('include-transitive-dependencies', false);
    if (value)
        return '--include-transitive';
    return '';
}

/**
 * Gets the include-prerelease-dependencies argument from the action.
 * @returns --include-prerelease if the argument is true.
 */
function getIncludePrereleaseDependenciesArgument(): string {
    const value = getBooleanInput('include-prerelease-dependencies', false);
    if (value)
        return '--include-prerelease';
    return '';
}

/**
 * Gets the include-highest-patch-only argument from the action.
 * @returns --highest-patch if the argument is true.
 */
function getIncludeHighestPatchOnlyArgument(): string {
    const value = getBooleanInput('include-highest-patch-only', false);
    if (value)
        return '--highest-patch';
    return '';
}

/**
 * Gets the include-highest-minor-only argument from the action.
 * @return --highest-patch if the argument is true.
 */
function getIncludeHighestMinorOnlyArgument(): string {
    const value = getBooleanInput('include-highest-minor-only', false);
    if (value)
        return '--highest-minor';
    return '';
}

/**
 * Gets an array of NuGet package source arguments from the action
 * @returns an array of --source {source} if the argument is set.
 */
function getNuGetSourceArguments(): string[] {
    const values = getStringArrayInput('nuget-sources');
    const sources: string[] = [];
    for (const value of values){
        sources.push(`--source ${value}`);
    }
    return sources;
}

/**
 * Gets the packages-to-exclude argument from the action
 * @returns --exclude {packages} if the argument is set.
 */
function getNuGetConfigArgument(): string {
    const value = getStringInput('nuget-config-file-path');
    if (value)
        return `--config ${value}`;
    return '';
}

/**
 * Gets an array of NuGet package source arguments from the action
 * @returns an array of --framework {framework} if the argument is set.
 */
function getFrameworkArguments(): string[] {
    const values = getStringArrayInput('frameworks');
    const sources: string[] = [];
    for (const value of values){
        sources.push(`--framework ${value}`);
    }
    return sources;
}

/**
 * List outdated packages
 * @returns the
 */
async function listOutdatedPackages(): Promise<Configuration> {
    const args: string[] = [
        getTargetArgument(),
        'package',
        '--outdated',
        getIncludeTransitiveDependenciesArgument(),
        getIncludePrereleaseDependenciesArgument(),
        getIncludeHighestMinorOnlyArgument(),
        getIncludeHighestPatchOnlyArgument(),
        ...getNuGetSourceArguments(),
        getNuGetConfigArgument(),
        ...getFrameworkArguments(),
        '--format json',
        '--verbosity q'
    ].filter(arg => arg !== '');

    debug(`Going to execute "dotnet ${args.join(" ")}"`);
    const output = await getExecOutput('dotnet', args);
    debug(`Executed "dotnet ${args.join(" ")}" and the status code is ${output.exitCode}`);

    if(output.exitCode === 0) {
        debug(`Executed "dotnet ${args.join(" ")}" and the output is ${output.stdout}`);
        return JSON.parse(output.stdout) as Configuration;
    }
    else
    {
        debug(`Executed "dotnet ${args.join(" ")}" and the output is ${output.stderr}`);
        throw new Error(output.stderr);
    }
}

export {
    listOutdatedPackages
};