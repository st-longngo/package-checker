"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  parsePackageJson,
  loadAffectedPackages,
  checkPackages,
} from "@/lib/package-checker";
import { AffectedPackagesData, CheckResult } from "@/lib/types";
import { AlertCircle, CheckCircle, Package, Shield, AlertTriangle } from "lucide-react";

export default function PackageChecker() {
  const [packageJsonInput, setPackageJsonInput] = useState("");
  const [affectedData, setAffectedData] = useState<AffectedPackagesData | null>(null);
  const [checkResult, setCheckResult] = useState<CheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [isValidPackageJsonShape, setIsValidPackageJsonShape] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // Load affected packages data on mount
  useEffect(() => {
    const loadData = async () => {
      const data = await loadAffectedPackages();
      if (data) {
        setAffectedData(data);
      } else {
        setError("Failed to load affected packages database");
      }
      setDataLoading(false);
    };
    loadData();
  }, []);

  const handleCheck = () => {
    setError(null);
    setCheckResult(null);
    setLoading(true);

    try {
      const packageJson = parsePackageJson(packageJsonInput);
      if (!packageJson) {
        setError("Invalid JSON format. Please check your input.");
        setLoading(false);
        return;
      }

      if (!affectedData) {
        setError("Affected packages data not loaded yet.");
        setLoading(false);
        return;
      }

      const result = checkPackages(packageJson, affectedData);
      setCheckResult(result);
    } catch (err) {
      setError("An error occurred while checking packages.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setPackageJsonInput("");
    setCheckResult(null);
    setError(null);
  };

  const loadSampleJson = () => {
    // Provide a minimal sample that only includes dependencies/devDependencies so
    // it passes the stricter textarea validation (no extra top-level fields).
    const sampleJson = {
      dependencies: {
        "next": "15.0.1",
        "react": "18.3.1"
      },
      devDependencies: {
        "eslint": "^8",
        "typescript": "^5"
      }
    };
    setPackageJsonInput(JSON.stringify(sampleJson, null, 2));
  };

  // Validate textarea JSON shape: must be an object with exactly two keys:
  // 'dependencies' and 'devDependencies' (no other top-level fields allowed).
  useEffect(() => {
    const raw = packageJsonInput?.trim();
    if (!raw) {
      setIsValidPackageJsonShape(false);
      setValidationMessage(null);
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
        setIsValidPackageJsonShape(false);
        setValidationMessage("Top-level JSON must be an object containing only 'dependencies' and 'devDependencies'.");
        return;
      }

      const keys = Object.keys(parsed);
      const allowed = ["dependencies", "devDependencies"];

      const hasExactlyAllowedKeys = keys.length === allowed.length && allowed.every((k) => keys.includes(k));
      if (!hasExactlyAllowedKeys) {
        setIsValidPackageJsonShape(false);
        setValidationMessage(`Invalid fields: expected only 'dependencies' and 'devDependencies', found: ${keys.join(", ") || "(none)"}`);
        return;
      }

      if (typeof parsed.dependencies !== "object" || parsed.dependencies === null || Array.isArray(parsed.dependencies)) {
        setIsValidPackageJsonShape(false);
        setValidationMessage("'dependencies' must be an object (or empty object).");
        return;
      }
      if (typeof parsed.devDependencies !== "object" || parsed.devDependencies === null || Array.isArray(parsed.devDependencies)) {
        setIsValidPackageJsonShape(false);
        setValidationMessage("'devDependencies' must be an object (or empty object).");
        return;
      }

      setIsValidPackageJsonShape(true);
      setValidationMessage(null);
    } catch {
      setIsValidPackageJsonShape(false);
      setValidationMessage("Invalid JSON format.");
    }
  }, [packageJsonInput]);

  if (dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-2xl">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <span className="text-lg">Loading affected packages database...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-12 h-12 text-indigo-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Package Security Checker</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Check if your npm packages are in the affected packages list
          </p>
          {affectedData && (
            <p className="text-sm text-gray-500 mt-2">
              Database: {affectedData.total_packages} affected packages (Updated:{" "}
              {new Date(affectedData.crawled_at).toLocaleDateString()})
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="w-5 h-5 mr-2" />
                package.json Input
              </CardTitle>
              <CardDescription>
                Paste your package.json content below to check for affected packages
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder='Paste your package.json content here...'
                value={packageJsonInput}
                onChange={(e) => setPackageJsonInput(e.target.value)}
                className="h-[360px] font-mono text-sm overflow-auto resize-none"
              />
              {validationMessage && (
                <div className="text-sm text-red-600">{validationMessage}</div>
              )}

              <div className="flex space-x-2">
                <Button
                  onClick={handleCheck}
                  disabled={!packageJsonInput || loading || !isValidPackageJsonShape}
                  className="flex-1"
                >
                  {loading ? "Checking..." : "Check Packages"}
                </Button>
                <Button onClick={handleClear} variant="outline">
                  Clear
                </Button>
                <Button onClick={loadSampleJson} variant="secondary">
                  Load Sample
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                {checkResult?.affectedPackages.length ? (
                  <>
                    <AlertCircle className="w-5 h-5 mr-2 text-red-500" />
                    Scan Results
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                    Scan Results
                  </>
                )}
              </CardTitle>
              <CardDescription>
                Analysis of your dependencies and devDependencies
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {!checkResult && !error && (
                <div className="text-center py-12 text-gray-400">
                  <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No results yet. Paste your package.json and click &quot;Check Packages&quot;</p>
                </div>
              )}

              {checkResult && (
                <div className="space-y-6">
                  {/* Summary */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {checkResult.totalPackages}
                      </div>
                      <div className="text-sm text-blue-800">Total Packages</div>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {checkResult.affectedPackages.length}
                      </div>
                      <div className="text-sm text-red-800">Affected</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {checkResult.safePackages}
                      </div>
                      <div className="text-sm text-green-800">Safe</div>
                    </div>
                  </div>

                  {/* Affected Packages List */}
                  {checkResult.affectedPackages.length > 0 ? (
                    <>
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Security Alert</AlertTitle>
                        <AlertDescription>
                          Found {checkResult.affectedPackages.length} package(s) in the affected list.
                          Please review and update these packages immediately.
                        </AlertDescription>
                      </Alert>

                      <ScrollArea className="h-[400px] pr-4">
                        <div className="space-y-3">
                          {checkResult.affectedPackages.map((pkg, index) => (
                            <Card key={index} className="bg-red-50 border-red-200">
                              <CardContent className="pt-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="font-semibold text-gray-900 mb-2">
                                      {pkg.packageName}
                                    </div>
                                    <div className="text-sm space-y-1">
                                      <div className="flex items-center text-gray-600">
                                        <span className="font-medium mr-2">Your version:</span>
                                        <Badge variant="outline">{pkg.installedVersion}</Badge>
                                      </div>
                                      <div className="text-gray-600">
                                        <span className="font-medium">Affected versions:</span>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                          {pkg.affectedVersions.slice(0, 5).map((v, i) => (
                                            <Badge key={i} variant="destructive" className="text-xs">
                                              {v}
                                            </Badge>
                                          ))}
                                          {pkg.affectedVersions.length > 5 && (
                                            <Badge variant="secondary" className="text-xs">
                                              +{pkg.affectedVersions.length - 5} more
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="ml-4 space-y-1">
                                    {pkg.isDependency && (
                                      <Badge className="bg-blue-500">Dependency</Badge>
                                    )}
                                    {pkg.isDevDependency && (
                                      <Badge className="bg-purple-500">DevDependency</Badge>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </ScrollArea>
                    </>
                  ) : (
                    <Alert className="bg-green-50 border-green-200">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertTitle className="text-green-800">All Clear!</AlertTitle>
                      <AlertDescription className="text-green-700">
                        None of your packages are in the affected packages list. Your project appears to be safe.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

  {/* Footer removed as requested */}
      </div>
    </div>
  );
}
