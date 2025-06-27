"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface Server {
  name: string;
  address: string;
  description: string;
  type: string;
}

interface ServerStatus {
  online?: boolean;
  motd?: {
    clean?: string;
  };
  players?: {
    online?: number;
    max?: number;
  };
  version?: {
    name?: string;
  };
  gamemode?: string;
}

const servers: Server[] = [
  {
    name: "Neo_Babel",
    address: "mc.nizaralghifary.my.id:19834",
    description: "Still Development",
    type: "Adventure"
  },
  {
    name: "Nzr_Survival",
    address: "survival.nizaralghifary.my.id:35768",
    description: "World Survival Biasa",
    type: "Survival"
  },
  {
    name: "Pioneer",
    address: "pioneer.aternos.me:15757",
    description: "World Survival Punya Azzam",
    type: "Survival"
  },
  {
    name: "Survival_2",
    address: "survival-2.nizaralghifary.my.id:40993",
    description: "World Survival Kedua",
    type: "Survival"
  }
];

export default function ServerList() {
  const [serverData, setServerData] = useState<Record<string, ServerStatus | null>>({});
  const [loadingServers, setLoadingServers] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const checkServerStatus = async (address: string) => {
    try {
      setLoadingServers(prev => new Set(prev).add(address));
      setError(null);

      const response = await fetch(`https://api.mcstatus.io/v2/status/bedrock/${encodeURIComponent(address)}`);
      
      if (!response.ok) {
        throw new Error(`Server ${address} not found`);
      }

      const data = await response.json();
      setServerData(prev => ({ ...prev, [address]: data }));
    } catch (err) {
      console.error('Error checking server status:', err);
      setError(`Failed to check server status: ${err instanceof Error ? err.message : String(err)}`);
      setServerData(prev => ({ ...prev, [address]: null }));
    } finally {
      setLoadingServers(prev => {
        const next = new Set(prev);
        next.delete(address);
        return next;
      });
    }
  };

  const getStatusDetails = (address: string) => {
    if (loadingServers.has(address)) {
      return { text: "Checking...", color: "text-gray-500" };
    }
    
    const status = serverData[address];
    if (status === null || status === undefined) {
      return { text: "Unknown", color: "text-gray-500" };
    }
    
    return status.online 
      ? { text: "Online", color: "text-green-500" }
      : { text: "Offline", color: "text-red-500" };
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> {error}
        </div>
        <Button 
          className="mt-4" 
          onClick={() => setError(null)}
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-4 sm:p-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-7xl">
        {servers.map((server) => {
          const status = getStatusDetails(server.address);
          const serverStatus = serverData[server.address];
          const isOnline = serverStatus?.online;

          return (
            <Card 
              className="flex flex-col justify-between p-5 w-full" 
              key={server.name}
            >
              <CardHeader>
                <CardTitle>{server.name}</CardTitle>
                <CardDescription className={status.color}>
                  {status.text}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex flex-col gap-3">
                <div className="text-sm bg-blue-500/20 text-blue-400 px-3 py-1 rounded-md w-fit">
                  {server.type}
                </div>
                <p className="text-gray-500 text-sm">{server.description}</p>
                <p className="text-gray-500 text-sm">Bedrock Only</p>

                {isOnline && serverStatus && (
                  <>
                    <p className="text-sm text-gray-400">
                      Server Status:
                    </p>
                    <p className="text-sm text-gray-400">
                      {serverStatus.motd?.clean || "N/A"}
                    </p>
                    <p className="text-sm text-gray-400">
                      Players: {serverStatus.players?.online || 0}/{serverStatus.players?.max || 0}
                    </p>
                    <p className="text-sm text-gray-400">
                      Version: {serverStatus.version?.name || "N/A"}
                    </p>
                    <p className="text-sm text-gray-400">
                      Gamemode: {serverStatus.gamemode || "N/A"}
                    </p>
                  </>
                )}

                <div className="flex flex-col gap-2 mt-4">
                  <Button
                    variant="default"
                    onClick={() => checkServerStatus(server.address)}
                    disabled={loadingServers.has(server.address)}
                  >
                    {loadingServers.has(server.address) ? "Checking..." : "Check Status"}
                  </Button>

                  <Button 
                    asChild
                    variant="outline" 
                    className="text-white bg-black"
                  >
                    <a
                      href={`minecraft://?addExternalServer=${encodeURIComponent(server.name)}|${server.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Join Server
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
