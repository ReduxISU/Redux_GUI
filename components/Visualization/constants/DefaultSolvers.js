// NOTE: Caleb - Temp fix for fixing visualization logic, should eventually be repaced with API info

const defaultSolvers = new Map([
    ["SAT3", "Sat3BacktrackingSolver"],
    ["CLIQUE", "CliqueBruteForce"],
    ["INDEPENDENTSET", "IndependentSetBruteForce"],
    ["VERTEXCOVER", "VertexCoverBruteForce"],
    ["ARCSET", "ArcSetBruteForce"],
    ["CUT","CutBruteForce"],
    ["CLIQUECOVER","CliqueCoverBruteForce"],
    ["GRAPHCOLORING","GraphColoringBruteForce"],
    ["HAMILTONIAN","HamiltonianBruteForce"],
    ["STEINERTREE","SteinerTreeBruteForce"],
    ["WEIGHTEDCUT","WeightedCutBruteForce"],
    ["DIRHAMILTONIAN","DirectedHamiltonianBruteForce"],
    ["TSP","TSPBruteForce"],
    ["NODESET", "NodeSetBruteForce"]
])

export default defaultSolvers;