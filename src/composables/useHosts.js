import { ref, computed } from 'vue'

const CATEGORIES = [
  [/^veneto/i,                              'Veneto'],
  [/^aopd/i,                                'AOPD'],
  [/^iov/i,                                 'IOV'],
  [/^pederzoli/i,                            'Pederzoli'],
  [/^aulss1/i,                              'AULSS 1'],
  [/^aulss2/i,                              'AULSS 2'],
  [/^aulss3/i,                              'AULSS 3'],
  [/^aulss4/i,                              'AULSS 4'],
  [/^aulss5/i,                              'AULSS 5'],
  [/^aulss6/i,                              'AULSS 6'],
  [/^aulss7/i,                              'AULSS 7'],
  [/^aulss8/i,                              'AULSS 8'],
  [/^aulss9/i,                              'AULSS 9'],
  [/^ambiente_oracle_azero_lab/i,           'Azero LAB (Oracle)'],
  [/^ambiente_oracle_azero_test/i,          'Azero TEST (Oracle)'],
  [/^ambiente_oracle_azero_prod/i,          'Azero PROD (Oracle)'],
  [/^ambiente_oracle_cittadino_test/i,      'Cittadino TEST (Oracle)'],
  [/^ambiente_oracle_cittadino_prod/i,      'Cittadino PROD (Oracle)'],
  [/^ambiente_azero_lab/i,                  'Azero LAB'],
  [/^ambiente_azero_test/i,                 'Azero TEST'],
  [/^ambiente_azero_prod/i,                 'Azero PROD'],
  [/^ambiente_cittadino_test/i,             'Cittadino TEST'],
  [/^ambiente_cittadino_prod/i,             'Cittadino PROD'],
  [/^safeaccess-(swarm[^-]+-)?staging/i,   'SafeAccess Staging'],
  [/^safeaccess-(swarm[^-]+-)?prod/i,      'SafeAccess Prod'],
  [/^safeaccess-(swarm[^-]+-)?demo/i,      'SafeAccess Demo'],
  [/^safeaccess-(swarm[^-]+-)?dev/i,       'SafeAccess Dev'],
  [/^safeaccess-/i,                         'SafeAccess'],
  [/^(aws_cloud|instabank|sonarqube|other-services|fse|safeaccess-latam|builder)/i, 'Cloud / AWS'],
  [/^(es[0-9]|lb[0-9]|salzano|bareggio|bergamo|ferrara|rho|oorrbg)/i, 'On-Prem Sites'],
  [/^(socksserver|proxmox|runner|win_vm|aws_cloud_es)/i, 'Infrastructure'],
]

export function categorize(host) {
  for (const [re, cat] of CATEGORIES) {
    if (re.test(host)) return cat
  }
  return 'Other'
}

export function roleTag(host) {
  const n = host.toLowerCase()
  if (n.includes('weblogin')) return { label: 'WEBLOGIN', color: '#56cfb2' }
  if (n.includes('ipam'))     return { label: 'IPAM',     color: '#7c6af7' }
  if (n.includes('proxy'))    return { label: 'PROXY',    color: '#f5a742' }
  if (n.includes('manager') || n.includes('worker')) return { label: 'SWARM', color: '#5eaeff' }
  if (/^lb\d/.test(n))        return { label: 'LB',       color: '#e879a0' }
  if (/^es\d/.test(n))        return { label: 'ES',       color: '#e879a0' }
  return null
}

const hosts = ref([])
const loaded = ref(false)

export function useHosts() {
  async function load() {
    if (loaded.value) return
    hosts.value = await window.electronAPI.listHosts()
    loaded.value = true
  }

  async function reload() {
    hosts.value = await window.electronAPI.listHosts()
    loaded.value = true
  }

  const grouped = computed(() => {
    const map = new Map()
    for (const h of hosts.value) {
      const cat = categorize(h.host)
      if (!map.has(cat)) map.set(cat, [])
      map.get(cat).push(h)
    }
    return new Map([...map.entries()].sort((a, b) => a[0].localeCompare(b[0])))
  })

  const categories = computed(() => ['All', ...grouped.value.keys()])

  return { hosts, grouped, categories, load, reload }
}
