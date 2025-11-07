{
  description = "Noir.js development environment with all necessary dependencies";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs = { self, nixpkgs }: 
    let
      # Supported systems
      systems = [ "x86_64-linux" "aarch64-linux" "x86_64-darwin" "aarch64-darwin" ];
      
      # Helper to generate attributes for all systems
      forAllSystems = nixpkgs.lib.genAttrs systems;
      
      # Helper to get nixpkgs for a system
      nixpkgsFor = forAllSystems (system: import nixpkgs {
        inherit system;
        config.allowUnfree = true;
      });
    in
    {
      devShells = forAllSystems (system:
        let
          pkgs = nixpkgsFor.${system};
          
          # Nargo installation script using noirup
          installNargo = pkgs.writeShellScriptBin "install-nargo" ''
            if ! command -v nargo &> /dev/null; then
              echo "?? Installing Nargo via noirup..."
              export PATH="$HOME/.nargo/bin:$PATH"
              if [ ! -f "$HOME/.nargo/bin/nargo" ]; then
                ${pkgs.curl}/bin/curl -L https://raw.githubusercontent.com/noir-lang/noirup/main/install | ${pkgs.bash}/bin/bash
                export PATH="$HOME/.nargo/bin:$PATH"
                noirup -v 1.0.0-beta.9
              fi
            fi
          '';
          
        in {
          default = pkgs.mkShell {
            buildInputs = with pkgs; [
              # Node.js and npm for Noir.js and frontend development
              nodejs_22
              
              # Development utilities
              git
              curl
              jq
              
              # Nargo installer
              installNargo
            ];

            shellHook = ''
              # Add nargo to PATH if it exists
              export PATH="$HOME/.nargo/bin:$PATH"
              
              echo "?? Noir.js ZK Rock-Paper-Scissors Development Environment"
              echo "=================================================="
              
              # Check and install nargo if needed
              if ! command -v nargo &> /dev/null; then
                echo "??  Nargo not found. Installing..."
                install-nargo
              fi
              
              echo ""
              echo "Available tools:"
              echo "  ? nargo $(nargo --version 2>/dev/null || echo '(run: install-nargo)')"
              echo "  ? node $(node --version)"
              echo "  ? npm $(npm --version)"
              echo ""
              echo "Quick commands:"
              echo "  ? cd circuit && nargo compile    - Compile Noir circuit"
              echo "  ? cd frontend && npm install     - Install frontend dependencies"
              echo "  ? cd frontend && npm run dev     - Start development server"
              echo "  ? install-nargo                  - Install/update Nargo"
              echo "=================================================="
            '';
          };
        }
      );
    };
}
