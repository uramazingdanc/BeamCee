"use client";
import React from "react";

import { useHandleStreamResponse } from "../utilities/runtime-helpers";

function MainComponent() {
  const [currentPage, setCurrentPage] = useState("home");
  const [beamType, setBeamType] = useState("");
  const [supportType, setSupportType] = useState("");
  const [materialProps, setMaterialProps] = useState({
    length: "",
    width: "",
    height: "",
    youngsModulus: "",
    momentOfInertia: "",
  });
  const [loads, setLoads] = useState({
    pointLoads: [],
    momentLoads: [],
    distributedLoads: [],
  });
  const [loadMagnitude, setLoadMagnitude] = useState("");
  const [loadPosition, setLoadPosition] = useState("");
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [loadType, setLoadType] = useState("");
  const [calculationSteps, setCalculationSteps] = useState([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  const handleStreamResponse = useHandleStreamResponse({
    onChunk: setStreamingMessage,
    onFinish: (message) => {
      const steps = message
        .split(/Step \d+:/g)
        .filter(Boolean)
        .map((step) => {
          return step
            .trim()
            .replace(/\\\[|\\\]/g, "")
            .replace(/\\text{/g, "")
            .replace(/}/g, "")
            .replace(/\$/g, "")
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean)
            .join("\n");
        });
      setCalculationSteps(steps);
      setIsCalculating(false);
    },
  });
  const resetCalculator = () => {
    setBeamType("");
    setSupportType("");
    setMaterialProps({
      length: "",
      width: "",
      height: "",
      youngsModulus: "",
      momentOfInertia: "",
    });
    setLoads({
      pointLoads: [],
      momentLoads: [],
      distributedLoads: [],
    });
    setCalculationSteps([]);
    setStreamingMessage("");
  };
  const addLoad = (type, value) => {
    if (type === "point") {
      setLoads((prev) => ({
        ...prev,
        pointLoads: [...prev.pointLoads, value],
      }));
    } else if (type === "moment") {
      setLoads((prev) => ({
        ...prev,
        momentLoads: [...prev.momentLoads, value],
      }));
    } else if (type === "distributed") {
      setLoads((prev) => ({
        ...prev,
        distributedLoads: [...prev.distributedLoads, value],
      }));
    }
    setShowLoadModal(false);
  };
  const calculateResults = async () => {
    setIsCalculating(true);
    setCalculationSteps([]);
    setStreamingMessage("");

    const prompt = `Calculate the beam analysis for:
    Beam Type: ${beamType}
    Support Type: ${supportType}
    Length: ${materialProps.length}m
    Width: ${materialProps.width}m
    Height: ${materialProps.height}m
    Young's Modulus: ${materialProps.youngsModulus}GPa
    Point Loads: ${JSON.stringify(loads.pointLoads)}
    Moment Loads: ${JSON.stringify(loads.momentLoads)}
    Distributed Loads: ${JSON.stringify(loads.distributedLoads)}
    
    Please provide a clear step-by-step solution in plain text format:
    
    Step 1: Initial Setup
    - Write out the beam configuration and dimensions in simple terms
    - List the material properties in standard units
    - Describe the load conditions in a clear way
    
    Step 2: Reaction Forces
    - Write the equilibrium equations in simple terms
    - Calculate the support reactions using basic math
    - Express all results in Newtons (N) or Newton-meters (Nm)
    
    Step 3: Shear Force Analysis
    - Explain how the shear force varies along the beam
    - Calculate the maximum shear force in Newtons (N)
    - Specify where the maximum occurs
    
    Step 4: Bending Moment Analysis
    - Describe how the bending moment changes along the beam
    - Calculate the maximum bending moment in Newton-meters (Nm)
    - Note the location of maximum moment
    
    Step 5: Deflection Analysis
    - Calculate the maximum deflection in millimeters (mm)
    - Specify where the maximum deflection occurs
    - Provide a simple interpretation of the results

    Write all calculations in plain numbers and standard units. Avoid using mathematical notation or symbols. Express all results in a clear, readable format.`;

    const response = await fetch("/integrations/chat-gpt/conversationgpt4", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: prompt }],
        stream: true,
      }),
    });

    handleStreamResponse(response);
  };

  if (currentPage === "home") {
    return (
      <div className="min-h-screen bg-[#e2e2e2]">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center space-y-8">
            <div className="text-center">
              <img
                src="https://ucarecdn.com/f291aa99-52ca-43a8-a8b4-42e6ffdbff05/-/format/auto/"
                alt="BeamCee Logo"
                className="w-[300px] md:w-[400px] mx-auto"
              />
            </div>

            <div className="w-full max-w-md space-y-4">
              <button
                onClick={() => setCurrentPage("calculator")}
                className="w-full bg-[#ff1ba7] hover:bg-[#e0178f] text-white font-roboto rounded-xl p-6 shadow-lg transform transition hover:scale-105"
              >
                <div className="flex items-center space-x-4">
                  <i className="fas fa-calculator text-2xl"></i>
                  <div className="text-left">
                    <h2 className="text-xl font-bold">Calculator</h2>
                    <p className="text-sm">Perform beam calculations</p>
                  </div>
                </div>
              </button>

              <button className="w-full bg-[#ff1ba7] hover:bg-[#e0178f] text-white font-roboto rounded-xl p-6 shadow-lg transform transition hover:scale-105">
                <div className="flex items-center space-x-4">
                  <i className="fas fa-chart-line text-2xl"></i>
                  <div className="text-left">
                    <h2 className="text-xl font-bold">
                      Analysis Visualization
                    </h2>
                    <p className="text-sm">View graphical results</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#e2e2e2]">
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => setCurrentPage("home")}
          className="mb-6 bg-[#ff1ba7] text-white px-4 py-2 rounded-lg"
        >
          <i className="fas fa-home mr-2"></i>Home
        </button>

        <div className="bg-white rounded-xl shadow-lg p-6 max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6 text-center">
            Beam Calculator
          </h1>

          <div className="space-y-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-4">1. Beam Modeling</h2>
              <div className="space-y-4">
                <div>
                  <label className="block mb-2">Beam Type</label>
                  <select
                    className="w-full p-2 border rounded"
                    value={beamType}
                    onChange={(e) => setBeamType(e.target.value)}
                  >
                    <option value="">Select Beam Type</option>
                    <option value="simply-supported">Simply Supported</option>
                    <option value="cantilever">Cantilever</option>
                    <option value="fixed">Fixed</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-2">Support Type</label>
                  <select
                    className="w-full p-2 border rounded"
                    value={supportType}
                    onChange={(e) => setSupportType(e.target.value)}
                  >
                    <option value="">Select Support Type</option>
                    <option value="fixed">Fixed</option>
                    <option value="roller">Roller</option>
                    <option value="pinned">Pinned</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2">Length (m)</label>
                    <input
                      type="number"
                      className="w-full p-2 border rounded"
                      value={materialProps.length}
                      onChange={(e) =>
                        setMaterialProps({
                          ...materialProps,
                          length: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block mb-2">Width (m)</label>
                    <input
                      type="number"
                      className="w-full p-2 border rounded"
                      value={materialProps.width}
                      onChange={(e) =>
                        setMaterialProps({
                          ...materialProps,
                          width: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block mb-2">Height (m)</label>
                    <input
                      type="number"
                      className="w-full p-2 border rounded"
                      value={materialProps.height}
                      onChange={(e) =>
                        setMaterialProps({
                          ...materialProps,
                          height: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block mb-2">Young's Modulus (GPa)</label>
                    <input
                      type="number"
                      className="w-full p-2 border rounded"
                      value={materialProps.youngsModulus}
                      onChange={(e) =>
                        setMaterialProps({
                          ...materialProps,
                          youngsModulus: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-4">2. Load Definition</h2>
              <div className="space-y-4">
                <button
                  className="bg-[#ff1ba7] text-white px-4 py-2 rounded w-full"
                  onClick={() => {
                    setLoadType("point");
                    setShowLoadModal(true);
                  }}
                >
                  Add Point Load
                </button>
                <button
                  className="bg-[#ff1ba7] text-white px-4 py-2 rounded w-full"
                  onClick={() => {
                    setLoadType("moment");
                    setShowLoadModal(true);
                  }}
                >
                  Add Moment Load
                </button>
                <button
                  className="bg-[#ff1ba7] text-white px-4 py-2 rounded w-full"
                  onClick={() => {
                    setLoadType("distributed");
                    setShowLoadModal(true);
                  }}
                >
                  Add Distributed Load
                </button>
                <div className="mt-4">
                  <h3 className="font-bold mb-2">Current Loads:</h3>
                  <div className="space-y-2">
                    {loads.pointLoads.map((load, index) => (
                      <div
                        key={`point-${index}`}
                        className="bg-white p-2 rounded"
                      >
                        Point Load: {load.magnitude}N at {load.position}m
                      </div>
                    ))}
                    {loads.momentLoads.map((load, index) => (
                      <div
                        key={`moment-${index}`}
                        className="bg-white p-2 rounded"
                      >
                        Moment: {load.magnitude}Nm at {load.position}m
                      </div>
                    ))}
                    {loads.distributedLoads.map((load, index) => (
                      <div
                        key={`distributed-${index}`}
                        className="bg-white p-2 rounded"
                      >
                        Distributed Load: {load.magnitude}N/m at {load.position}
                        m
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-4">3. Results</h2>
              <div className="flex space-x-4 mb-4">
                <button
                  className="bg-[#ff1ba7] text-white px-4 py-2 rounded flex-1"
                  onClick={calculateResults}
                  disabled={isCalculating}
                >
                  {isCalculating ? "Calculating..." : "Calculate"}
                </button>
                <button
                  className="bg-gray-500 text-white px-4 py-2 rounded flex-1"
                  onClick={resetCalculator}
                  disabled={isCalculating}
                >
                  <i className="fas fa-redo mr-2"></i>New Calculation
                </button>
              </div>
              <div className="mt-4 space-y-6">
                {isCalculating ? (
                  <div className="p-8 border rounded bg-white min-h-[200px] flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#ff1ba7] border-t-transparent"></div>
                    <p className="mt-6 text-gray-600 text-lg">
                      Analyzing beam structure...
                    </p>
                  </div>
                ) : calculationSteps.length > 0 ? (
                  calculationSteps.map((step, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-lg shadow-lg overflow-hidden"
                    >
                      <div className="bg-[#ff1ba7] text-white px-6 py-3">
                        <h3 className="text-xl font-bold">Step {index + 1}</h3>
                      </div>
                      <div className="p-6">
                        <div className="prose max-w-none">
                          <div className="font-mono text-base leading-relaxed whitespace-pre-wrap">
                            {step}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 border rounded bg-white min-h-[200px] flex items-center justify-center">
                    <p className="text-gray-500 text-lg text-center">
                      Enter beam properties and loads, then click Calculate to
                      see the analysis
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showLoadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              Add {loadType.charAt(0).toUpperCase() + loadType.slice(1)} Load
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block mb-2">Magnitude</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded"
                  placeholder="Enter magnitude"
                  onChange={(e) => setLoadMagnitude(e.target.value)}
                />
              </div>
              <div>
                <label className="block mb-2">Position (m from left)</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded"
                  placeholder="Enter position"
                  onChange={(e) => setLoadPosition(e.target.value)}
                />
              </div>
              <div className="flex space-x-4">
                <button
                  className="bg-[#ff1ba7] text-white px-4 py-2 rounded flex-1"
                  onClick={() =>
                    addLoad(loadType, {
                      magnitude: loadMagnitude,
                      position: loadPosition,
                    })
                  }
                >
                  Add
                </button>
                <button
                  className="bg-gray-500 text-white px-4 py-2 rounded flex-1"
                  onClick={() => setShowLoadModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MainComponent;