import {
  AffectedPackagesData,
  PackageJson,
  AffectedPackageResult,
  CheckResult,
} from "./types";

/**
 * Parse package.json string and extract dependencies and devDependencies
 */
export function parsePackageJson(jsonString: string): PackageJson | null {
  try {
    const parsed = JSON.parse(jsonString);
    return parsed;
  } catch (error) {
    console.error("Failed to parse package.json:", error);
    return null;
  }
}

/**
 * Load affected packages data from the JSON file
 */
export async function loadAffectedPackages(): Promise<AffectedPackagesData | null> {
  try {
    const response = await fetch("/affected_packages_20251126_104743.json");
    if (!response.ok) {
      throw new Error("Failed to fetch affected packages data");
    }
    const data: AffectedPackagesData = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to load affected packages:", error);
    return null;
  }
}

/**
 * Check if a package is in the affected packages list
 */
export function checkPackages(
  packageJson: PackageJson,
  affectedData: AffectedPackagesData
): CheckResult {
  const affectedPackages: AffectedPackageResult[] = [];
  const allPackages = new Set<string>();

  // Create a map of affected packages for quick lookup
  const affectedMap = new Map<string, string[]>();
  affectedData.packages.forEach((pkg) => {
    if (!affectedMap.has(pkg.package_name)) {
      affectedMap.set(pkg.package_name, []);
    }
    affectedMap.get(pkg.package_name)?.push(pkg.version);
  });

  // Check dependencies
  if (packageJson.dependencies) {
    Object.entries(packageJson.dependencies).forEach(([name, version]) => {
      allPackages.add(name);
      if (affectedMap.has(name)) {
        affectedPackages.push({
          packageName: name,
          installedVersion: version,
          affectedVersions: affectedMap.get(name) || [],
          isDependency: true,
          isDevDependency: false,
        });
      }
    });
  }

  // Check devDependencies
  if (packageJson.devDependencies) {
    Object.entries(packageJson.devDependencies).forEach(([name, version]) => {
      allPackages.add(name);
      if (affectedMap.has(name)) {
        // Check if already added as dependency
        const existing = affectedPackages.find(
          (pkg) => pkg.packageName === name
        );
        if (existing) {
          existing.isDevDependency = true;
        } else {
          affectedPackages.push({
            packageName: name,
            installedVersion: version,
            affectedVersions: affectedMap.get(name) || [],
            isDependency: false,
            isDevDependency: true,
          });
        }
      }
    });
  }

  return {
    totalPackages: allPackages.size,
    affectedPackages,
    safePackages: allPackages.size - affectedPackages.length,
  };
}

/**
 * Compare version strings (basic comparison, you might want to use semver library for production)
 */
export function compareVersions(version1: string, version2: string): boolean {
  // Remove ^ and ~ prefixes
  const v1 = version1.replace(/^[\^~]/, "");
  const v2 = version2.replace(/^[\^~]/, "");
  return v1 === v2;
}
